import { Link } from "react-router-dom"
import { Ticket } from "lucide-react"
import { useMyRegistrations } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { SubmissionStatusBadge } from "@/features/events/badges"
import { formatDate } from "@/lib/utils"

export default function MyRegistrationsPage() {
  const { data, isLoading } = useMyRegistrations()

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">My registrations</h1>
      <p className="mt-1.5 text-base-600 dark:text-base-300/70">Every event you've registered for, in one place.</p>

      <div className="mt-8 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-card" />)}
        {!isLoading && !data?.results.length && (
          <EmptyState icon={Ticket} title="No registrations yet" description="Once you register for an event, it'll show up here." />
        )}
        {data?.results.map((r) => (
          <Link key={r.id} to={`/my-registrations/${r.id}`}>
            <Card className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.event_name}</p>
                <p className="text-sm text-base-600 dark:text-base-300/60">{r.registration_id} · {formatDate(r.submitted_at)}</p>
              </div>
              <SubmissionStatusBadge status={r.status} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
