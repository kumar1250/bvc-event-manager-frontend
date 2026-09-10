import { useState } from "react"
import { Users } from "lucide-react"
import type { FormSubmissionListItem } from "@/types/api"
import { EmptyState } from "@/components/ui/state-blocks"
import { SubmissionStatusBadge } from "@/features/events/badges"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { SubmissionDetailDialog } from "./SubmissionDetailDialog"

export function RegistrationsTable({
  data,
  showEvent = true,
}: {
  data: FormSubmissionListItem[]
  showEvent?: boolean
}) {
  const [openId, setOpenId] = useState<number | null>(null)

  if (!data.length) {
    return <EmptyState icon={Users} title="No registrations yet" description="They'll show up here as students register." />
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-card border border-base-200 dark:border-base-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-base-50 dark:bg-base-900 text-left text-xs text-base-600 dark:text-base-300/60">
              <th className="px-4 py-3 font-medium">Registration ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              {showEvent && <th className="px-4 py-3 font-medium">Event</th>}
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100 dark:divide-base-800">
            {data.map((r) => (
              <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer hover:bg-base-50 dark:hover:bg-base-800/40 transition-colors">
                <td className="px-4 py-3 font-medium">{r.registration_id}</td>
                <td className="px-4 py-3">{r.name || "—"}</td>
                <td className="px-4 py-3 text-base-600 dark:text-base-300/70">{r.email || "—"}</td>
                {showEvent && <td className="px-4 py-3">{r.event_name}</td>}
                <td className="px-4 py-3 text-base-600 dark:text-base-300/60">{formatDate(r.submitted_at)}</td>
                <td className="px-4 py-3"><SubmissionStatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {data.map((r) => (
          <Card key={r.id} className="p-4 cursor-pointer" onClick={() => setOpenId(r.id)}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{r.name || r.registration_id}</p>
              <SubmissionStatusBadge status={r.status} />
            </div>
            <p className="text-sm text-base-600 dark:text-base-300/60 mt-1">{r.registration_id}</p>
            {showEvent && <p className="text-sm text-base-600 dark:text-base-300/60">{r.event_name}</p>}
            <p className="text-xs text-base-600 dark:text-base-300/50 mt-1">{formatDate(r.submitted_at)}</p>
          </Card>
        ))}
      </div>

      <SubmissionDetailDialog id={openId} open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)} />
    </>
  )
}
