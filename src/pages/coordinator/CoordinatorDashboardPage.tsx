import { Link } from "react-router-dom"
import { useMyCoordinatorDashboard } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { CalendarDays } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function CoordinatorDashboardPage() {
  const { data, isLoading } = useMyCoordinatorDashboard()

  if (isLoading) {
    return <div className="space-y-5"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-40 rounded-card" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Your events</h1>
        <p className="mt-1.5 text-base-600 dark:text-base-300/70">{data?.total_registrations ?? 0} total registrations across your assigned events.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!data?.assigned_events?.length && (
          <div className="col-span-full">
            <EmptyState icon={CalendarDays} title="No events assigned yet" description="An admin will assign you to events to manage." />
          </div>
        )}
        {data?.assigned_events?.map((e: any) => (
          <Link key={e.id} to={`/coordinator/events/${e.id}/registrations`}>
            <Card className="p-5 hover:-translate-y-0.5 transition-transform">
              <p className="font-medium">{e.name}</p>
              <p className="text-sm text-base-600 dark:text-base-300/60 mt-1">{formatDate(e.date)} · {e.venue}</p>
              <p className="text-sm text-accent-600 dark:text-accent-400 mt-3 font-medium">{e.registration_count} registered</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent registrations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!data?.recent_registrations?.length && <p className="text-sm text-base-600 dark:text-base-300/60">No registrations yet.</p>}
          {data?.recent_registrations?.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-base-50 dark:hover:bg-base-800/40">
              <div>
                <p className="text-sm font-medium">{r.event}</p>
                <p className="text-xs text-base-600 dark:text-base-300/60">{r.registration_id}</p>
              </div>
              <span className="text-xs text-base-600 dark:text-base-300/60">{formatDate(r.submitted_at)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
