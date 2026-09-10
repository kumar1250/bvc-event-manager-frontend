import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Ban, GitBranch, CalendarDays } from "lucide-react"
import { useAdminEvents, useDeleteEvent, useCancelEvent } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { EventStatusBadge, CategoryBadge } from "@/features/events/badges"
import { formatDate } from "@/lib/utils"
import { extractErrorMessage } from "@/lib/apiClient"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

export default function AdminEventsListPage() {
  const [page] = useState(1)
  const { data, isLoading } = useAdminEvents({ page: String(page) })
  const deleteEvent = useDeleteEvent()
  const cancelEvent = useCancelEvent()
  const navigate = useNavigate()

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This also deletes its forms and registrations.`)) return
    try {
      await deleteEvent.mutateAsync(id)
      toast.success("Event deleted")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleCancel(id: number, name: string) {
    if (!confirm(`Cancel "${name}"? Registrants will be emailed.`)) return
    try {
      await cancelEvent.mutateAsync(id)
      toast.success("Event cancelled — registrants notified")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">Events</h1>
          <p className="mt-1.5 text-base-600 dark:text-base-300/70">Create and manage every event on the platform.</p>
        </div>
        <Button onClick={() => navigate("/admin/events/create")}><Plus className="h-4 w-4" /> Create event</Button>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-card" />)}
        {!isLoading && !data?.results.length && (
          <EmptyState icon={CalendarDays} title="No events yet" description="Create your first event to get started." action={{ label: "Create event", onClick: () => navigate("/admin/events/create") }} />
        )}
        {data?.results.map((e) => (
          <Card key={e.id} className="p-4 sm:p-5 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{e.name}</p>
                <EventStatusBadge status={e.status} />
                <CategoryBadge category={e.category} />
              </div>
              <p className="text-sm text-base-600 dark:text-base-300/60 mt-1">
                {formatDate(e.date)} · {e.venue} · {e.registration_count}{e.max_participants ? `/${e.max_participants}` : ""} registered
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link to={`/admin/events/${e.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to={`/admin/events/${e.id}/flow`}><GitBranch className="h-4 w-4" /> Event flow</Link></DropdownMenuItem>
                {e.status !== "cancelled" && (
                  <DropdownMenuItem onClick={() => handleCancel(e.id, e.name)} className="text-warning-500"><Ban className="h-4 w-4" /> Cancel</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDelete(e.id, e.name)} className="text-danger-500"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>
    </div>
  )
}
