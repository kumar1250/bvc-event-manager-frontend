import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient, onForcedLogout, tokenStore } from "@/lib/apiClient"
import type { User } from "@/types/api"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (payload: { full_name: string; email: string; password: string; confirm_password: string }) => Promise<User>
  logout: () => void
  refreshMe: () => Promise<void>
  setUser: (u: User | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refreshMe() {
    const { data } = await apiClient.get<User>("/auth/me/")
    setUser(data)
  }

  useEffect(() => {
    onForcedLogout(() => setUser(null))
    ;(async () => {
      if (tokenStore.getAccess()) {
        try {
          await refreshMe()
        } catch {
          tokenStore.clear()
        }
      }
      setIsLoading(false)
    })()
  }, [])

  async function login(email: string, password: string) {
    const { data } = await apiClient.post("/auth/login/", { email, password })
    tokenStore.set(data.access, data.refresh)
    setUser(data.user)
    return data.user as User
  }

  async function register(payload: { full_name: string; email: string; password: string; confirm_password: string }) {
    const { data } = await apiClient.post("/auth/register/", payload)
    tokenStore.set(data.access, data.refresh)
    setUser(data.user)
    return data.user as User
  }

  function logout() {
    tokenStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshMe, setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
