import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, Plus, GripVertical, Trash2, Pencil, Check } from "lucide-react"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  useAddFlowStep, useAdminEvent, useDeleteFlowStep, useEventFlow, useReorderFlowSteps, useUpdateFlowStep,
} from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Input, Textarea, Label } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/state-blocks"
import { GitBranch } from "lucide-react"
import { extractErrorMessage } from "@/lib/apiClient"
import type { EventFlowStep } from "@/types/api"
import { cn } from "@/lib/utils"

interface StepFormValues {
  title: string
  description: string
  date: string
  time: string
  status: "pending" | "in_progress" | "completed"
}

function SortableStep({ step, onEdit, onDelete }: { step: EventFlowStep; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 rounded-xl border border-base-200 dark:border-base-800 bg-white dark:bg-base-900 p-3", isDragging && "opacity-50 shadow-lg")}
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-base-400 active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className={cn("h-2 w-2 rounded-full shrink-0",
        step.status === "completed" ? "bg-success-500" : step.status === "in_progress" ? "bg-accent-500" : "bg-base-300 dark:bg-base-700")} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{step.title}</p>
        {(step.date || step.time) && <p className="text-xs text-base-600 dark:text-base-300/60">{step.date} {step.time}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-danger-500"><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

export default function AdminEventFlowPage() {
  const { id } = useParams()
  const { data: event } = useAdminEvent(id)
  const { data: steps, isLoading } = useEventFlow(id)
  const addStep = useAddFlowStep(id!)
  const updateStep = useUpdateFlowStep(id!)
  const deleteStep = useDeleteFlowStep(id!)
  const reorder = useReorderFlowSteps(id!)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EventFlowStep | null>(null)
  const { register, handleSubmit, reset } = useForm<StepFormValues>()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function openCreate() {
    setEditing(null)
    reset({ title: "", description: "", date: "", time: "", status: "pending" })
    setDialogOpen(true)
  }
  function openEdit(step: EventFlowStep) {
    setEditing(step)
    reset({ title: step.title, description: step.description, date: step.date || "", time: step.time || "", status: step.status })
    setDialogOpen(true)
  }

  async function onSave(values: StepFormValues) {
    try {
      if (editing) {
        await updateStep.mutateAsync({ id: editing.id, ...values, date: values.date || null, time: values.time || null })
        toast.success("Step updated")
      } else {
        await addStep.mutateAsync({ ...values, date: values.date || null, time: values.time || null, order: steps?.length ?? 0 })
        toast.success("Step added")
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleDelete(stepId: number) {
    if (!confirm("Delete this step?")) return
    try {
      await deleteStep.mutateAsync(stepId)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  function onDragEnd(e: DragEndEvent) {
    if (!steps || !e.over || e.active.id === e.over.id) return
    const oldIndex = steps.findIndex((s) => s.id === e.active.id)
    const newIndex = steps.findIndex((s) => s.id === e.over!.id)
    const newOrder = arrayMove(steps, oldIndex, newIndex).map((s) => s.id)
    reorder.mutate(newOrder)
  }

  return (
    <div className="max-w-2xl">
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-base-600 dark:text-base-300/60 hover:text-base-900 dark:hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{event?.name} — Event flow</h1>
          <p className="mt-1.5 text-base-600 dark:text-base-300/70">Drag to reorder the timeline students will see.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add step</Button>
      </div>

      {isLoading && <div className="space-y-2"><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></div>}
      {!isLoading && !steps?.length && <EmptyState icon={GitBranch} title="No steps yet" description="Add the first step in this event's timeline." action={{ label: "Add step", onClick: openCreate }} />}
      {!!steps?.length && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {steps.map((step) => (
                <SortableStep key={step.id} step={step} onEdit={() => openEdit(step)} onDelete={() => handleDelete(step.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit step" : "Add step"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" className="mt-1.5" {...register("title", { required: true })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="mt-1.5" {...register("date")} />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" className="mt-1.5" {...register("time")} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1.5 flex gap-2">
                {(["pending", "in_progress", "completed"] as const).map((s) => (
                  <label key={s} className="flex-1">
                    <input type="radio" value={s} {...register("status")} className="peer sr-only" />
                    <span className="block cursor-pointer rounded-xl border border-base-200 dark:border-base-800 px-3 py-2 text-center text-xs font-medium peer-checked:border-accent-500 peer-checked:bg-accent-500/10 peer-checked:text-accent-600 dark:peer-checked:text-accent-400">
                      {s.replace("_", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit"><Check className="h-4 w-4" /> {editing ? "Save" : "Add step"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
