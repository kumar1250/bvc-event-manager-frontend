import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import type {
  CoordinatorMini, DashboardStats, EventDetail, EventListItem, EventFlowStep,
  FormSubmissionDetail, FormSubmissionListItem, Notification, Paginated,
  RegistrationForm, RegistrationFormListItem, User,
} from "@/types/api"

// ------------------------------------------------------------- events

export function useEvents(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<EventListItem>>("/events/", { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useEvent(idOrSlug: string | number | undefined) {
  return useQuery({
    queryKey: ["event", idOrSlug],
    queryFn: async () => {
      const { data } = await apiClient.get<EventDetail>(`/events/${idOrSlug}/`)
      return data
    },
    enabled: !!idOrSlug,
  })
}

export function useAdminEvents(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["admin-events", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<EventListItem>>("/events/admin/list/", { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useAdminEvent(id: number | string | undefined) {
  return useQuery({
    queryKey: ["admin-event", id],
    queryFn: async () => {
      const { data } = await apiClient.get<EventDetail>(`/events/admin/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post("/events/admin/list/", payload)
      return data as EventListItem
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-events"] }),
  })
}

export function useUpdateEvent(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.patch(`/events/admin/${id}/`, payload)
      return data as EventDetail
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] })
      qc.invalidateQueries({ queryKey: ["admin-event", String(id)] })
      qc.invalidateQueries({ queryKey: ["event"] })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/events/admin/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-events"] }),
  })
}

export function useCancelEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.post(`/events/admin/${id}/cancel/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] })
      qc.invalidateQueries({ queryKey: ["admin-event"] })
    },
  })
}

// --------------------------------------------------------- event flow

export function useEventFlow(eventId: number | string | undefined) {
  return useQuery({
    queryKey: ["event-flow", eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<EventFlowStep[]>(`/events/${eventId}/flow/`)
      return data
    },
    enabled: !!eventId,
  })
}

export function useAddFlowStep(eventId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<EventFlowStep>) => {
      const { data } = await apiClient.post(`/events/${eventId}/flow/`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-flow", eventId] }),
  })
}

export function useUpdateFlowStep(eventId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<EventFlowStep> & { id: number }) => {
      const { data } = await apiClient.patch(`/events/${eventId}/flow/${id}/`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-flow", eventId] }),
  })
}

export function useDeleteFlowStep(eventId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/events/${eventId}/flow/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-flow", eventId] }),
  })
}

export function useReorderFlowSteps(eventId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (order: number[]) => {
      const { data } = await apiClient.post(`/events/${eventId}/flow/reorder/`, { order })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-flow", eventId] }),
  })
}

// ------------------------------------------------------- coordinators

export function useCoordinators() {
  return useQuery({
    queryKey: ["coordinators"],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<CoordinatorMini>>("/coordinators/")
      return data
    },
  })
}

export function useAdminCoordinators() {
  return useQuery({
    queryKey: ["admin-coordinators"],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<any>>("/coordinators/admin/list/")
      return data
    },
  })
}

export function useCreateCoordinator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post("/coordinators/admin/list/", payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coordinators"] }),
  })
}

export function useUpdateCoordinator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Record<string, unknown> & { id: number }) => {
      const { data } = await apiClient.patch(`/coordinators/admin/${id}/`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coordinators"] }),
  })
}

export function useDeleteCoordinator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/coordinators/admin/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coordinators"] }),
  })
}

export function useToggleCoordinatorActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.post(`/coordinators/admin/${id}/toggle-active/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coordinators"] }),
  })
}

export function useMyCoordinatorEvents() {
  return useQuery({
    queryKey: ["my-coordinator-events"],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<EventListItem>>("/coordinators/me/events/")
      return data
    },
  })
}

export function useMyCoordinatorDashboard() {
  return useQuery({
    queryKey: ["my-coordinator-dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/coordinators/me/dashboard/")
      return data
    },
  })
}

// -------------------------------------------------------------- forms

export function usePublicForm(id: number | string | undefined) {
  return useQuery({
    queryKey: ["public-form", id],
    queryFn: async () => {
      const { data } = await apiClient.get<RegistrationForm>(`/forms/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useSubmitForm(id: number | string) {
  return useMutation({
    mutationFn: async (answers: Record<string, unknown>) => {
      const { data } = await apiClient.post<FormSubmissionDetail>(`/forms/${id}/submit/`, { answers })
      return data
    },
  })
}

export function useAdminForms(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["admin-forms", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<RegistrationFormListItem>>("/forms/admin/list/", { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useAdminFormBuilder(id: number | string | undefined) {
  return useQuery({
    queryKey: ["admin-form-builder", id],
    queryFn: async () => {
      const { data } = await apiClient.get<RegistrationForm>(`/forms/admin/${id}/builder/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { event: number; title: string }) => {
      const { data } = await apiClient.post("/forms/admin/list/", payload)
      return data as RegistrationFormListItem
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-forms"] }),
  })
}

export function useSaveFormBuilder(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { title: string; description?: string; fields: unknown[] }) => {
      const { data } = await apiClient.put(`/forms/admin/${id}/builder/`, payload)
      return data as RegistrationForm
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-form-builder", String(id)] })
      qc.invalidateQueries({ queryKey: ["admin-forms"] })
    },
  })
}

export function useSetFormStatus(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (status: string) => {
      const { data } = await apiClient.post(`/forms/admin/${id}/status/`, { status })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-forms"] })
      qc.invalidateQueries({ queryKey: ["admin-form-builder", String(id)] })
    },
  })
}

export function useDeleteForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/forms/admin/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-forms"] }),
  })
}

export function useFormResponses(formId: number | string | undefined, params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["form-responses", formId, params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<FormSubmissionListItem>>(`/forms/admin/${formId}/responses/`, { params })
      return data
    },
    enabled: !!formId,
    placeholderData: keepPreviousData,
  })
}

// ------------------------------------------------------- registrations

export function useAdminRegistrations(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["admin-registrations", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<FormSubmissionListItem>>("/registrations/", { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useSubmissionDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: async () => {
      const { data } = await apiClient.get<FormSubmissionDetail>(`/forms/submissions/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useSetSubmissionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await apiClient.post(`/forms/submissions/${id}/status/`, { status })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-registrations"] })
      qc.invalidateQueries({ queryKey: ["form-responses"] })
      qc.invalidateQueries({ queryKey: ["submission"] })
    },
  })
}

export function useDeleteSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/forms/submissions/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-registrations"] })
      qc.invalidateQueries({ queryKey: ["form-responses"] })
    },
  })
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<FormSubmissionListItem>>("/registrations/mine/")
      return data
    },
  })
}

export function useMyRegistrationDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ["my-registration", id],
    queryFn: async () => {
      const { data } = await apiClient.get<FormSubmissionDetail>(`/registrations/mine/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function exportUrl(base: string, params: Record<string, string | undefined>) {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v && usp.set(k, v))
  return `${base}?${usp.toString()}`
}

// ------------------------------------------------------- notifications

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Notification>>("/notifications/")
      return data
    },
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.post(`/notifications/${id}/read/`),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: ["notifications"] })
      const prev = qc.getQueryData<Paginated<Notification>>(["notifications"])
      if (prev) {
        qc.setQueryData(["notifications"], {
          ...prev,
          results: prev.results.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        })
      }
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["notifications"], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => apiClient.post("/notifications/read-all/"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

// ----------------------------------------------------------- dashboard

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>("/dashboard/stats/")
      return data
    },
  })
}

export function useMyDashboard() {
  return useQuery({
    queryKey: ["my-dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/me/")
      return data
    },
  })
}

// ----------------------------------------------------------------users

export function useAdminUsers(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<User>>("/auth/admin/users/", { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useUpdateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Record<string, unknown> & { id: number }) => {
      const { data } = await apiClient.patch(`/auth/admin/users/${id}/`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/auth/admin/users/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  })
}

export function useAdminResetUserPassword() {
  return useMutation({
    mutationFn: async (id: number) => apiClient.post(`/auth/admin/users/${id}/reset-password/`),
  })
}
