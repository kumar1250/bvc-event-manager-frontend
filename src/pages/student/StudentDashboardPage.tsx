import { Link } from "react-router-dom"
import { CalendarDays, ClipboardList, MapPin } from "lucide-react"
import { useMyDashboard } from "@/lib/queries"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { Button } from "@/components/ui/button"
import { SubmissionStatusBadge } from "@/features/events/badges"
import { formatDate } from "@/lib/utils"

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useMyDashboard()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Hey {user?.full_name?.split(" ")[0] || "there"} 👋</h1>
        <p className="mt-1.5 text-base-600 dark:text-base-300/70">Here's what's on your plate.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-5"><Skeleton className="h-40 rounded-card" /><Skeleton className="h-40 rounded-card" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Upcoming events</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!data?.upcoming_events?.length && <EmptyState icon={CalendarDays} title="Nothing coming up" description="Browse events to find something to register for." action={{ label: "Browse events", onClick: () => {} }} />}
              {data?.upcoming_events?.map((e: any) => (
                <Link key={e.id} to={`/events/${e.id}`} className="flex items-center justify-between rounded-xl border border-base-200 dark:border-base-800 p-3 hover:bg-base-50 dark:hover:bg-base-800/40 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-base-600 dark:text-base-300/60 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {e.venue}</p>
                  </div>
                  <span className="text-xs text-base-600 dark:text-base-300/60">{formatDate(e.date)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick stats</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10">
                  <ClipboardList className="h-6 w-6 text-accent-500" />
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold">{data?.registered_events_count ?? 0}</p>
                  <p className="text-sm text-base-600 dark:text-base-300/60">Events registered</p>
                </div>
              </div>
              <Link to="/my-registrations"><Button variant="outline" size="sm" className="mt-4 w-full">View my registrations</Button></Link>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Recent registrations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!data?.registration_history?.length && <p className="text-sm text-base-600 dark:text-base-300/60">No registrations yet.</p>}
          {data?.registration_history?.slice(0, 5).map((r: any) => (
            <Link key={r.id} to={`/my-registrations/${r.id}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-base-50 dark:hover:bg-base-800/40">
              <div>
                <p className="text-sm font-medium">{r.event_name}</p>
                <p className="text-xs text-base-600 dark:text-base-300/60">{r.registration_id}</p>
              </div>
              <SubmissionStatusBadge status={r.status} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
