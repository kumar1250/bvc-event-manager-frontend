import { useEffect, useState } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import type { FieldOption, FormField } from "@/types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input, Textarea, Label, HelpText } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { OPTION_TYPES, NON_INPUT_TYPES } from "@/features/forms/fieldTypeMeta"

export function FieldEditorDialog({
  field,
  allFields,
  open,
  onOpenChange,
  onSave,
}: {
  field: FormField | null
  allFields: FormField[]
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (field: FormField) => void
}) {
  const [draft, setDraft] = useState<FormField | null>(field)

  useEffect(() => setDraft(field), [field])

  if (!draft) return null

  const hasOptions = OPTION_TYPES.includes(draft.field_type)
  // Uniqueness only makes sense for a single stored value, not layout
  // elements or multi-value fields (checkbox groups, multiselect).
  const canBeUnique = !NON_INPUT_TYPES.includes(draft.field_type) && !["checkbox", "multiselect", "terms"].includes(draft.field_type)
  const priorFields = allFields.filter((f) => f.id !== draft.id && f.order < draft.order && !["section", "heading", "description"].includes(f.field_type))
  const parentField = priorFields.find((f) => f.id === draft.depends_on_field)

  function update<K extends keyof FormField>(key: K, value: FormField[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  function addOption() {
    if (!draft) return
    const opts = draft.options ?? []
    update("options", [...opts, { label: "", value: "", order: opts.length }])
  }
  function updateOption(i: number, label: string) {
    if (!draft) return
    const opts = [...(draft.options ?? [])]
    opts[i] = { ...opts[i], label, value: label }
    update("options", opts)
  }
  function removeOption(i: number) {
    if (!draft) return
    update("options", (draft.options ?? []).filter((_, idx) => idx !== i))
  }
  function moveOption(i: number, dir: -1 | 1) {
    if (!draft) return
    const opts = [...(draft.options ?? [])]
    const j = i + dir
    if (j < 0 || j >= opts.length) return
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
    update("options", opts.map((o, idx) => ({ ...o, order: idx })))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit field</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input className="mt-1.5" value={draft.label} onChange={(e) => update("label", e.target.value)} />
          </div>
          <div>
            <Label>Placeholder</Label>
            <Input className="mt-1.5" value={draft.placeholder || ""} onChange={(e) => update("placeholder", e.target.value)} />
          </div>
          <div>
            <Label>Description / help text</Label>
            <Textarea className="mt-1.5" value={draft.description || ""} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox checked={draft.required} onCheckedChange={(v) => update("required", !!v)} id="required" />
            <Label htmlFor="required">Required field</Label>
          </div>
          {canBeUnique && (
            <div className="flex items-center gap-2.5">
              <Checkbox checked={draft.unique} onCheckedChange={(v) => update("unique", !!v)} id="unique" />
              <Label htmlFor="unique">Unique (no two submissions can share this value)</Label>
            </div>
          )}
          <div>
            <Label>Default value</Label>
            <Input className="mt-1.5" value={draft.default_value || ""} onChange={(e) => update("default_value", e.target.value)} />
          </div>

          {["short_text", "long_text", "address"].includes(draft.field_type) && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min length</Label><Input className="mt-1.5" type="number" value={draft.min_length ?? ""} onChange={(e) => update("min_length", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><Label>Max length</Label><Input className="mt-1.5" type="number" value={draft.max_length ?? ""} onChange={(e) => update("max_length", e.target.value ? Number(e.target.value) : null)} /></div>
            </div>
          )}
          {draft.field_type === "number" && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min value</Label><Input className="mt-1.5" type="number" value={draft.min_value ?? ""} onChange={(e) => update("min_value", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><Label>Max value</Label><Input className="mt-1.5" type="number" value={draft.max_value ?? ""} onChange={(e) => update("max_value", e.target.value ? Number(e.target.value) : null)} /></div>
            </div>
          )}

          {hasOptions && (
            <div>
              <Label>Options</Label>
              <div className="mt-1.5 space-y-2">
                {(draft.options ?? []).map((o: FieldOption, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Input value={o.label} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveOption(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveOption(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)} className="text-danger-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}><Plus className="h-3.5 w-3.5" /> Add option</Button>
              </div>
            </div>
          )}

          {!!priorFields.length && (
            <div className="rounded-xl border border-base-200 dark:border-base-800 p-3.5 space-y-3">
              <p className="text-sm font-medium">Conditional logic</p>
              <HelpText>Only show this field based on an earlier field's answer.</HelpText>
              <div>
                <Label>Show only if</Label>
                <Select
                  value={draft.depends_on_field ? String(draft.depends_on_field) : "none"}
                  onValueChange={(v) => { update("depends_on_field", v === "none" ? null : Number(v)); update("depends_on_value", "") }}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No condition</SelectItem>
                    {priorFields.map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {draft.depends_on_field != null && (
                <div>
                  <Label>Equals</Label>
                  {parentField && OPTION_TYPES.includes(parentField.field_type) ? (
                    <Select value={draft.depends_on_value || ""} onValueChange={(v) => update("depends_on_value", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a value" /></SelectTrigger>
                      <SelectContent>{(parentField.options ?? []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input className="mt-1.5" value={draft.depends_on_value || ""} onChange={(e) => update("depends_on_value", e.target.value)} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(draft)}>Save field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
