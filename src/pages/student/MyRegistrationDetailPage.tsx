import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useMyRegistrationDetail } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/state-blocks"
import { SubmissionStatusBadge } from "@/features/events/badges"
import { formatDate } from "@/lib/utils"

export default function MyRegistrationDetailPage() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useMyRegistrationDetail(id)

  if (isLoading) return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-64 w-full rounded-card" /></div>
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/my-registrations" className="inline-flex items-center gap-1.5 text-sm text-base-600 dark:text-base-300/60 hover:text-base-900 dark:hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to registrations
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{data.event_name}</CardTitle>
            <p className="text-sm text-base-600 dark:text-base-300/60 mt-1">{data.registration_id} · Submitted {formatDate(data.submitted_at)}</p>
          </div>
          <SubmissionStatusBadge status={data.status} />
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-base-100 dark:divide-base-800">
            {Object.entries(data.answers_dict).map(([label, value]) => (
              <div key={label} className="py-3 grid grid-cols-2 gap-4">
                <p className="text-sm text-base-600 dark:text-base-300/60">{label}</p>
                <p className="text-sm font-medium text-right break-words">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
