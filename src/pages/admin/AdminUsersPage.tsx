import { useState } from "react"
import { toast } from "sonner"
import { Users as UsersIcon, KeyRound } from "lucide-react"
import { useAdminUsers, useAdminResetUserPassword, useDeleteAdminUser, useUpdateAdminUser } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { extractErrorMessage } from "@/lib/apiClient"
import { Pagination } from "@/components/ui/pagination"

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const { data, isLoading } = useAdminUsers({ page: String(page), search: search || undefined, role: role !== "all" ? role : undefined })
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()
  const resetPassword = useAdminResetUserPassword()

  async function toggleActive(id: number, current: boolean) {
    try {
      await updateUser.mutateAsync({ id, is_active_account: !current })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete user "${name}"?`)) return
    try {
      await deleteUser.mutateAsync(id)
      toast.success("User deleted")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleReset(id: number) {
    try {
      await resetPassword.mutateAsync(id)
      toast.success("Reset link sent")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Users</h1>
      <p className="mt-1.5 text-base-600 dark:text-base-300/70">{data?.count ?? 0} registered users.</p>

      <div className="mt-5 flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl border border-base-200 dark:border-base-800 bg-white dark:bg-base-900 px-3.5 h-11 flex-1 min-w-[220px] max-w-xs">
          <Search className="h-4 w-4 text-base-600 dark:text-base-300/50" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search name or email" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="coordinator">Coordinator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}
        {!isLoading && !data?.results.length && <EmptyState icon={UsersIcon} title="No users found" />}
        {data?.results.map((u) => (
          <Card key={u.id} className="p-4 flex items-center gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{u.full_name}</p>
              <p className="text-xs text-base-600 dark:text-base-300/60">{u.email}</p>
            </div>
            <Badge variant="outline">{u.role}</Badge>
            <div className="flex items-center gap-2">
              <Switch checked={u.is_active_account} onCheckedChange={() => toggleActive(u.id, u.is_active_account)} />
              <span className="text-xs text-base-600 dark:text-base-300/60">{u.is_active_account ? "Active" : "Disabled"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleReset(u.id)} title="Send password reset"><KeyRound className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="text-danger-500" onClick={() => handleDelete(u.id, u.full_name)}>Delete</Button>
          </Card>
        ))}
      </div>
      {data && <Pagination page={page} onPageChange={setPage} hasNext={!!data.next} hasPrev={!!data.previous} total={data.count} />}
    </div>
  )
}
