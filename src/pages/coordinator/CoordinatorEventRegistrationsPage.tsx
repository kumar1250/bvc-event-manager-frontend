import { useState } from "react"
import { useParams } from "react-router-dom"
import { useAdminEvent, useFormResponses, useAdminForms } from "@/lib/queries"
import { RegistrationsTable } from "@/features/registrations/RegistrationsTable"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"

export default function CoordinatorEventRegistrationsPage() {
  const { id } = useParams()
  const [page, setPage] = useState(1)
  const { data: event } = useAdminEvent(id)
  const { data: forms } = useAdminForms({ event: id })
  const activeForm = forms?.results?.[0]
  const { data, isLoading } = useFormResponses(activeForm?.id, { page: String(page) })

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{event?.name || "Event"} registrations</h1>
      <p className="mt-1.5 text-base-600 dark:text-base-300/70">All submissions for this event's registration form.</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-16 rounded-card" /><Skeleton className="h-16 rounded-card" /></div>
        ) : (
          <>
            <RegistrationsTable data={data?.results ?? []} showEvent={false} />
            {data && (
              <Pagination page={page} onPageChange={setPage} hasNext={!!data.next} hasPrev={!!data.previous} total={data.count} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
