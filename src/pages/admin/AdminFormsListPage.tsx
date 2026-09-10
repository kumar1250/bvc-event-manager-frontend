import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Plus, ClipboardList, Pencil, Trash2, Eye } from "lucide-react"
import { useAdminForms, useAdminEvents, useCreateForm, useDeleteForm } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { FormStatusBadge } from "@/features/events/badges"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input, Label } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { extractErrorMessage } from "@/lib/apiClient"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

interface CreateValues { event: string; title: string }

export default function AdminFormsListPage() {
  const { data, isLoading } = useAdminForms()
  const { data: events } = useAdminEvents()
  const createForm = useCreateForm()
  const deleteForm = useDeleteForm()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, watch, setValue, reset } = useForm<CreateValues>()

  async function onCreate(values: CreateValues) {
    try {
      const created = await createForm.mutateAsync({ event: Number(values.event), title: values.title })
      toast.success("Form created")
      setOpen(false)
      reset()
      navigate(`/admin/forms/${created.id}/builder`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This also deletes its responses.`)) return
    try {
      await deleteForm.mutateAsync(id)
      toast.success("Form deleted")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">Forms</h1>
          <p className="mt-1.5 text-base-600 dark:text-base-300/70">Every registration form, across every event.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create form</Button>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-card" />)}
        {!isLoading && !data?.results.length && (
          <EmptyState icon={ClipboardList} title="No forms yet" description="Create a form to start collecting registrations." action={{ label: "Create form", onClick: () => setOpen(true) }} />
        )}
        {data?.results.map((f) => (
          <Card key={f.id} className="p-4 sm:p-5 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{f.title}</p>
                <FormStatusBadge status={f.status} />
              </div>
              <p className="text-sm text-base-600 dark:text-base-300/60 mt-1">{f.event_name} · {f.field_count} fields · {f.submission_count} responses</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link to={`/admin/forms/${f.id}/builder`}><Pencil className="h-4 w-4" /> Edit builder</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to={`/admin/forms/${f.id}/responses`}><Eye className="h-4 w-4" /> View responses</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(f.id, f.title)} className="text-danger-500"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create a form</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <div>
              <Label>Event</Label>
              <Select value={watch("event")} onValueChange={(v) => setValue("event", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose an event" /></SelectTrigger>
                <SelectContent>{events?.results.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Form title</Label>
              <Input id="title" className="mt-1.5" placeholder="e.g. Engineering Day Registration" {...register("title", { required: true })} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createForm.isPending}>{createForm.isPending ? "Creating…" : "Create & open builder"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
