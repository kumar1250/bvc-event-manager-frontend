import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SubmissionStatusBadge } from "@/features/events/badges"
import { useDeleteSubmission, useSetSubmissionStatus, useSubmissionDetail } from "@/lib/queries"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { extractErrorMessage } from "@/lib/apiClient"

export function SubmissionDetailDialog({
  id,
  open,
  onOpenChange,
}: {
  id: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading } = useSubmissionDetail(id ?? undefined)
  const setStatus = useSetSubmissionStatus()
  const del = useDeleteSubmission()

  async function act(status: "approved" | "rejected") {
    if (!id) return
    try {
      await setStatus.mutateAsync({ id, status })
      toast.success(`Registration ${status}`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm("Delete this registration? This cannot be undone.")) return
    try {
      await del.mutateAsync(id)
      toast.success("Registration deleted")
      onOpenChange(false)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registration details</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-32 w-full" /></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display text-lg font-semibold">{data.registration_id}</p>
                <p className="text-sm text-base-600 dark:text-base-300/60">{data.event_name} · {formatDate(data.submitted_at)}</p>
              </div>
              <SubmissionStatusBadge status={data.status} />
            </div>
            <div className="divide-y divide-base-100 dark:divide-base-800 rounded-xl border border-base-100 dark:border-base-800">
              {Object.entries(data.answers_dict).map(([label, value]) => (
                <div key={label} className="px-4 py-2.5 grid grid-cols-2 gap-4">
                  <p className="text-sm text-base-600 dark:text-base-300/60">{label}</p>
                  <p className="text-sm font-medium text-right break-words">{value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" className="text-danger-500" onClick={handleDelete} disabled={del.isPending}>Delete</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => act("rejected")} disabled={setStatus.isPending || data?.status === "rejected"}>Reject</Button>
            <Button onClick={() => act("approved")} disabled={setStatus.isPending || data?.status === "approved"}>Approve</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
