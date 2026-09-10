import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

// Comma-separated list of backend servers, in priority order, e.g.:
//   VITE_API_BASE_URLS=https://main.onrender.com/api/v2,https://backup.onrender.com/api/v2
// Falls back to the old singular VITE_API_BASE_URL, then localhost, so
// nothing breaks if only one server is configured.
const RAW_URLS =
  import.meta.env.VITE_API_BASE_URLS || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v2"

const SERVERS = RAW_URLS.split(",")
  .map((u: string) => u.trim().replace(/\/+$/, ""))
  .filter(Boolean)

// How long to wait for a server before treating it as "down" and failing
// over to the next one. Render free-tier instances that are asleep take a
// while to spin up (~30-50s) but DO respond eventually rather than refusing
// the connection - so this timeout is a deliberate trade-off between "wait
// out a cold start" and "fail over quickly". Tune if you hit false failovers.
const REQUEST_TIMEOUT_MS = 12_000

const ACTIVE_SERVER_KEY = "fest_active_api_server_index"

function loadInitialServerIndex(): number {
  const saved = Number(localStorage.getItem(ACTIVE_SERVER_KEY))
  return Number.isInteger(saved) && saved >= 0 && saved < SERVERS.length ? saved : 0
}

let activeIndex = loadInitialServerIndex()

function getBaseUrl(): string {
  return SERVERS[activeIndex]
}

function switchToServer(index: number) {
  activeIndex = index
  localStorage.setItem(ACTIVE_SERVER_KEY, String(index))
  apiClient.defaults.baseURL = SERVERS[index]
  if (import.meta.env.DEV) {
    console.warn(`[apiClient] switched to backend #${index}: ${SERVERS[index]}`)
  }
}

/** True for connection failures (server down/unreachable/timed out) - as opposed to a real HTTP error response. */
function isNetworkFailure(error: AxiosError): boolean {
  return !error.response
}

const ACCESS_KEY = "fest_access_token"
const REFRESH_KEY = "fest_refresh_token"

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export const apiClient = axios.create({ baseURL: getBaseUrl(), timeout: REQUEST_TIMEOUT_MS })

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh-on-401 queueing so parallel requests don't each fire their own refresh.
let isRefreshing = false
let queue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

function flushQueue(error: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  queue = []
}

// Listeners the app (auth context) can subscribe to for forced logout.
type LogoutListener = () => void
const logoutListeners: LogoutListener[] = []
export function onForcedLogout(cb: LogoutListener) {
  logoutListeners.push(cb)
}
function forceLogout() {
  tokenStore.clear()
  logoutListeners.forEach((cb) => cb())
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _serverAttempt?: number })
      | undefined

    // --- Server failover: this server didn't respond at all, try the next one ---
    if (isNetworkFailure(error) && original && SERVERS.length > 1) {
      original._serverAttempt = (original._serverAttempt ?? 0) + 1
      if (original._serverAttempt < SERVERS.length) {
        switchToServer((activeIndex + 1) % SERVERS.length)
        original.baseURL = getBaseUrl()
        return apiClient(original)
      }
      // every server was tried and failed - fall through and reject below
    }

    if (error.response?.status !== 401 || !original || original._retry || original.url?.includes("/auth/token/refresh/")) {
      return Promise.reject(error)
    }

    const refresh = tokenStore.getRefresh()
    if (!refresh) {
      forceLogout()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(original))
          },
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true
    try {
      const { data } = await axios.post(`${getBaseUrl()}/auth/token/refresh/`, { refresh })
      tokenStore.set(data.access, data.refresh)
      flushQueue(null, data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return apiClient(original)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data === "string") return data
    if (data?.detail) return data.detail
    if (data && typeof data === "object") {
      const first = Object.values(data)[0]
      if (Array.isArray(first)) return String(first[0])
      if (typeof first === "string") return first
    }
    return err.message
  }
  return "Something went wrong. Please try again."
}

/** Field-level errors as returned by DRF (e.g. dynamic form submission 400s). */
export function extractFieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object") {
    const data = err.response.data as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(data)) {
      out[k] = Array.isArray(v) ? String(v[0]) : String(v)
    }
    return out
  }
  return {}
}
