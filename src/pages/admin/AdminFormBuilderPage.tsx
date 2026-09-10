import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, GripVertical, Trash2, Copy, Pencil, Eye, Save } from "lucide-react"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useAdminFormBuilder, useSaveFormBuilder, useSetFormStatus } from "@/lib/queries"
import type { FieldType, FormField, FormStatus, RegistrationForm } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { FormStatusBadge } from "@/features/events/badges"
import { FIELD_TYPE_META } from "@/features/forms/fieldTypeMeta"
import { AddFieldMenu } from "@/features/formbuilder/AddFieldMenu"
import { FieldEditorDialog } from "@/features/formbuilder/FieldEditorDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DynamicFormRenderer } from "@/features/forms/DynamicFormRenderer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { extractErrorMessage } from "@/lib/apiClient"
import { cn } from "@/lib/utils"

let tempIdCounter = -1
function nextTempId() {
  return tempIdCounter--
}

function SortableFieldRow({ field, onEdit, onDuplicate, onDelete }: {
  field: FormField
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id! })
  const meta = FIELD_TYPE_META[field.field_type]
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 rounded-xl border border-base-200 dark:border-base-800 bg-white dark:bg-base-900 p-3.5", isDragging && "opacity-50 shadow-lg")}
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-base-400 active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <meta.icon className="h-4 w-4 text-accent-500 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{field.label || "Untitled field"}</p>
        <p className="text-xs text-base-600 dark:text-base-300/60">{meta.label}{field.required && " · Required"}{field.depends_on_field && " · Conditional"}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onDuplicate}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-danger-500"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function AdminFormBuilderPage() {
  const { id } = useParams()
  const { data, isLoading } = useAdminFormBuilder(id)
  const saveMutation = useSaveFormBuilder(id!)
  const statusMutation = useSetFormStatus(id!)

  const [title, setTitle] = useState("")
  const [fields, setFields] = useState<FormField[]>([])
  const [status, setStatus] = useState<FormStatus>("draft")
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (data) {
      setTitle(data.title)
      setFields(data.fields.map((f) => ({ ...f })))
      setStatus(data.status)
      setDirty(false)
    }
  }, [data])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function addField(type: FieldType) {
    const meta = FIELD_TYPE_META[type]
    const newField: FormField = {
      id: nextTempId(),
      label: meta.label,
      field_type: type,
      required: false,
      order: fields.length,
      options: ["radio", "checkbox", "dropdown", "multiselect"].includes(type)
        ? [{ label: "Option 1", value: "Option 1", order: 0 }]
        : [],
    }
    setFields((f) => [...f, newField])
    setDirty(true)
    setEditingField(newField)
    setEditorOpen(true)
  }

  function saveFieldEdit(updated: FormField) {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    setEditorOpen(false)
    setDirty(true)
  }

  function duplicateField(field: FormField) {
    const copy: FormField = { ...field, id: nextTempId(), label: `${field.label} (copy)`, order: fields.length }
    setFields((f) => [...f, copy])
    setDirty(true)
  }

  function deleteField(field: FormField) {
    setFields((prev) => prev.filter((f) => f.id !== field.id).map((f, i) => ({ ...f, order: i })))
    setDirty(true)
  }

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === e.active.id)
      const newIndex = prev.findIndex((f) => f.id === e.over!.id)
      return arrayMove(prev, oldIndex, newIndex).map((f, i) => ({ ...f, order: i }))
    })
    setDirty(true)
  }

  async function handleSave() {
    try {
      await saveMutation.mutateAsync({ title, fields })
      toast.success("Form saved")
      setDirty(false)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleStatusChange(next: FormStatus) {
    try {
      await statusMutation.mutateAsync(next)
      setStatus(next)
      toast.success(`Form ${next}`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  if (isLoading || !data) {
    return <div className="space-y-3"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></div>
  }

  const previewForm: RegistrationForm = { ...data, title, fields }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/forms" className="inline-flex items-center gap-1.5 text-sm text-base-600 dark:text-base-300/60 hover:text-base-900 dark:hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to forms
      </Link>

      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-base-50/90 dark:bg-base-950/90 backdrop-blur-lg border-b border-base-200 dark:border-base-800 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true) }} className="flex-1 min-w-[180px] font-medium" />
          <FormStatusBadge status={status} />
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4" /> Preview</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Status</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["draft", "active", "inactive", "closed"] as FormStatus[]).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending || !dirty}>
              <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4"><AddFieldMenu onAdd={addField} /></div>

      {!fields.length ? (
        <p className="text-sm text-base-600 dark:text-base-300/60 text-center py-12">No fields yet — add your first field above.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={fields.map((f) => f.id!)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {fields.map((field) => (
                <SortableFieldRow
                  key={field.id}
                  field={field}
                  onEdit={() => { setEditingField(field); setEditorOpen(true) }}
                  onDuplicate={() => duplicateField(field)}
                  onDelete={() => deleteField(field)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FieldEditorDialog
        field={editingField}
        allFields={fields}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={saveFieldEdit}
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{title || "Form preview"}</DialogTitle></DialogHeader>
          <DynamicFormRenderer form={previewForm} onSubmit={() => toast.info("This is a preview — nothing was submitted.")} submitLabel="Submit (preview)" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
