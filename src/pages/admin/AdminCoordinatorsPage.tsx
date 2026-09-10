import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Plus, UserCog, Trash2, Power } from "lucide-react"
import { useAdminCoordinators, useAdminEvents, useCreateCoordinator, useDeleteCoordinator, useToggleCoordinatorActive } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input, Label, FieldError } from "@/components/ui/input"
import { extractErrorMessage } from "@/lib/apiClient"
import { initials } from "@/lib/utils"

interface FormValues {
  name: string
  email: string
  department: string
  designation: string
  password: string
}

export default function AdminCoordinatorsPage() {
  const { data, isLoading } = useAdminCoordinators()
  const { data: events } = useAdminEvents()
  const createCoordinator = useCreateCoordinator()
  const toggleActive = useToggleCoordinatorActive()
  const deleteCoordinator = useDeleteCoordinator()
  const [open, setOpen] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  async function onCreate(values: FormValues) {
    try {
      await createCoordinator.mutateAsync({ ...values, assigned_events: selectedEvents })
      toast.success("Coordinator created")
      setOpen(false)
      reset()
      setSelectedEvents([])
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remove coordinator "${name}"?`)) return
    try {
      await deleteCoordinator.mutateAsync(id)
      toast.success("Coordinator removed")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">Coordinators</h1>
          <p className="mt-1.5 text-base-600 dark:text-base-300/70">People who help run events.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add coordinator</Button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-card" />)}
        {!isLoading && !data?.results.length && (
          <div className="col-span-full"><EmptyState icon={UserCog} title="No coordinators yet" action={{ label: "Add coordinator", onClick: () => setOpen(true) }} /></div>
        )}
        {data?.results.map((c: any) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between">
              <Avatar className="h-12 w-12">
                <AvatarImage src={c.profile_image_url} />
                <AvatarFallback>{initials(c.name)}</AvatarFallback>
              </Avatar>
              <Badge variant={c.is_active ? "success" : "neutral"}>{c.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="font-medium mt-3">{c.name}</p>
            <p className="text-xs text-base-600 dark:text-base-300/60">{c.designation} · {c.department}</p>
            <p className="text-xs text-base-600 dark:text-base-300/60 mt-1">{c.email}</p>
            <p className="text-xs text-base-600 dark:text-base-300/60 mt-1">{c.assigned_events?.length ?? 0} assigned event(s)</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => toggleActive.mutate(c.id)}><Power className="h-3.5 w-3.5" /> {c.is_active ? "Deactivate" : "Activate"}</Button>
              <Button variant="ghost" size="sm" className="text-danger-500" onClick={() => handleDelete(c.id, c.name)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add coordinator</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" className="mt-1.5" {...register("name", { required: "Required" })} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1.5" {...register("email", { required: "Required" })} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="department">Department</Label><Input id="department" className="mt-1.5" {...register("department")} /></div>
              <div><Label htmlFor="designation">Designation</Label><Input id="designation" className="mt-1.5" {...register("designation")} /></div>
            </div>
            <div>
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" type="password" className="mt-1.5" {...register("password", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })} />
              <FieldError>{errors.password?.message}</FieldError>
            </div>
            <div>
              <Label>Assign events</Label>
              <div className="mt-1.5 max-h-32 overflow-y-auto space-y-1.5 rounded-xl border border-base-200 dark:border-base-800 p-2.5">
                {events?.results.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(e.id)}
                      onChange={(ev) => setSelectedEvents((prev) => ev.target.checked ? [...prev, e.id] : prev.filter((id) => id !== e.id))}
                    />
                    {e.name}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createCoordinator.isPending}>{createCoordinator.isPending ? "Creating…" : "Create coordinator"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
