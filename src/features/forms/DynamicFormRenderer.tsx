import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import type { FormField, RegistrationForm } from "@/types/api"
import { NON_INPUT_TYPES } from "./fieldTypeMeta"
import { Input, Textarea, Label, FieldError, HelpText } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export type AnswerMap = Record<string, string | string[]>

function fieldKey(field: FormField) {
  return `f_${field.id}`
}

function conditionMet(field: FormField, values: Record<string, unknown>, fields: FormField[]): boolean {
  if (!field.depends_on_field) return true
  const parent = fields.find((f) => f.id === field.depends_on_field)
  if (!parent) return true
  const parentValue = values[fieldKey(parent)]
  if (parentValue == null) return false
  if (Array.isArray(parentValue)) return parentValue.includes(field.depends_on_value)
  return String(parentValue) === String(field.depends_on_value)
}

function validateField(field: FormField, value: unknown): string | null {
  const isEmpty =
    value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)

  if (field.required && isEmpty) return "This field is required."
  if (isEmpty) return null

  switch (field.field_type) {
    case "email": {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return "Enter a valid email address."
      break
    }
    case "phone": {
      if (!/^[0-9+\-\s()]{7,20}$/.test(String(value))) return "Enter a valid phone number."
      break
    }
    case "number": {
      const num = Number(value)
      if (Number.isNaN(num)) return "Must be a number."
      if (field.min_value != null && num < field.min_value) return `Must be at least ${field.min_value}.`
      if (field.max_value != null && num > field.max_value) return `Must be at most ${field.max_value}.`
      break
    }
    case "url": {
      if (!/^https?:\/\//.test(String(value))) return "Enter a valid URL (starting with http:// or https://)."
      break
    }
    case "short_text":
    case "long_text":
    case "address": {
      const len = String(value).length
      if (field.min_length && len < field.min_length) return `Must be at least ${field.min_length} characters.`
      if (field.max_length && len > field.max_length) return `Must be at most ${field.max_length} characters.`
      break
    }
    case "terms": {
      if (value !== true && value !== "true") return "You must accept to continue."
      break
    }
  }
  if (field.validation_regex) {
    try {
      const re = new RegExp(field.validation_regex)
      if (!re.test(String(value))) return "Invalid format."
    } catch {
      /* ignore bad regex authored in builder */
    }
  }
  return null
}

interface Props {
  form: RegistrationForm
  onSubmit: (answers: AnswerMap) => void
  submitting?: boolean
  serverFieldErrors?: Record<string, string>
  submitLabel?: string
  disabled?: boolean
  disabledMessage?: string
}

export function DynamicFormRenderer({
  form,
  onSubmit,
  submitting,
  serverFieldErrors,
  submitLabel = "Submit Registration",
  disabled,
  disabledMessage,
}: Props) {
  const fields = useMemo(() => [...form.fields].sort((a, b) => a.order - b.order), [form.fields])

  const defaultValues = useMemo(() => {
    const dv: Record<string, unknown> = {}
    fields.forEach((f) => {
      if (NON_INPUT_TYPES.includes(f.field_type)) return
      if (f.field_type === "checkbox" || f.field_type === "multiselect") dv[fieldKey(f)] = f.default_value ? [f.default_value] : []
      else if (f.field_type === "terms") dv[fieldKey(f)] = false
      else dv[fieldKey(f)] = f.default_value || ""
    })
    return dv
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id])

  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm({ defaultValues })
  const values = watch()

  useEffect(() => {
    if (!serverFieldErrors) return
    Object.entries(serverFieldErrors).forEach(([label, message]) => {
      const field = fields.find((f) => f.label === label)
      if (field) setError(fieldKey(field), { type: "server", message })
    })
  }, [serverFieldErrors, fields, setError])

  function submit(data: Record<string, unknown>) {
    let hasError = false
    fields.forEach((field) => {
      if (NON_INPUT_TYPES.includes(field.field_type)) return
      if (!conditionMet(field, data, fields)) return
      const err = validateField(field, data[fieldKey(field)])
      if (err) {
        hasError = true
        setError(fieldKey(field), { type: "validate", message: err })
      }
    })
    if (hasError) return

    const answers: AnswerMap = {}
    fields.forEach((field) => {
      if (NON_INPUT_TYPES.includes(field.field_type) || !field.id) return
      if (!conditionMet(field, data, fields)) return
      const val = data[fieldKey(field)]
      const isEmpty = val === "" || val === undefined || val === null || (Array.isArray(val) && val.length === 0)
      if (isEmpty) return
      answers[String(field.id)] = field.field_type === "terms" ? "Yes" : (val as string | string[])
    })
    onSubmit(answers)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {disabled && disabledMessage && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-500">
          {disabledMessage}
        </div>
      )}
      <AnimatePresence initial={false}>
        {fields.map((field) => {
          const visible = conditionMet(field, values, fields)
          if (!visible) return null
          return (
            <motion.div
              key={field.id ?? field.label}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <FieldBlock
                field={field}
                control={control}
                error={field.id ? (errors[fieldKey(field)]?.message as string | undefined) : undefined}
                disabled={disabled || submitting}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>

      {!disabled && (
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Submitting…" : submitLabel}
        </Button>
      )}
    </form>
  )
}

function FieldBlock({
  field,
  control,
  error,
  disabled,
}: {
  field: FormField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  error?: string
  disabled?: boolean
}) {
  const name = fieldKey(field)
  const options = field.options ?? []

  if (field.field_type === "heading") {
    return <h3 className="font-display text-xl font-semibold pt-2">{field.label}</h3>
  }
  if (field.field_type === "description") {
    return <p className="text-sm text-base-600 dark:text-base-300/70 leading-relaxed">{field.label}</p>
  }
  if (field.field_type === "section") {
    return (
      <div className="pt-4 first:pt-0">
        <p className="font-display text-base font-semibold">{field.label}</p>
        {field.description && <p className="text-sm text-base-600 dark:text-base-300/60 mt-0.5">{field.description}</p>}
        <div className="mt-3 h-px bg-base-200 dark:bg-base-800" />
      </div>
    )
  }

  const label = (
    <Label htmlFor={name}>
      {field.label}
      {field.required && <span className="text-danger-500 ml-0.5">*</span>}
    </Label>
  )

  return (
    <div>
      {field.field_type !== "terms" && (
        <div className="mb-1.5">
          {label}
          {field.description && <HelpText>{field.description}</HelpText>}
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field: rhf }) => {
          switch (field.field_type) {
            case "short_text":
            case "email":
            case "phone":
            case "url":
            case "image_url":
              return (
                <Input
                  id={name}
                  type={field.field_type === "email" ? "email" : "text"}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  aria-invalid={!!error}
                  {...rhf}
                />
              )
            case "number":
              return (
                <Input
                  id={name} type="number" placeholder={field.placeholder} disabled={disabled}
                  aria-invalid={!!error} {...rhf}
                />
              )
            case "long_text":
            case "address":
              return <Textarea id={name} placeholder={field.placeholder} disabled={disabled} aria-invalid={!!error} {...rhf} />
            case "date":
              return <Input id={name} type="date" disabled={disabled} aria-invalid={!!error} {...rhf} />
            case "time":
              return <Input id={name} type="time" disabled={disabled} aria-invalid={!!error} {...rhf} />
            case "datetime":
              return <Input id={name} type="datetime-local" disabled={disabled} aria-invalid={!!error} {...rhf} />
            case "file_upload":
              return (
                <Input
                  id={name} type="url" placeholder="Paste a link to your uploaded file" disabled={disabled}
                  aria-invalid={!!error} {...rhf}
                />
              )
            case "dropdown":
              return (
                <Select value={rhf.value} onValueChange={rhf.onChange} disabled={disabled}>
                  <SelectTrigger aria-invalid={!!error}><SelectValue placeholder={field.placeholder || "Select an option"} /></SelectTrigger>
                  <SelectContent>
                    {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )
            case "radio":
              return (
                <RadioGroup value={rhf.value} onValueChange={rhf.onChange} disabled={disabled}>
                  {options.map((o) => (
                    <label key={o.value} className="flex items-center gap-2.5 cursor-pointer text-[15px]">
                      <RadioGroupItem value={o.value} /> {o.label}
                    </label>
                  ))}
                </RadioGroup>
              )
            case "checkbox":
            case "multiselect": {
              const arr: string[] = Array.isArray(rhf.value) ? rhf.value : []
              return (
                <div className="grid gap-2.5">
                  {options.map((o) => (
                    <label key={o.value} className="flex items-center gap-2.5 cursor-pointer text-[15px]">
                      <Checkbox
                        checked={arr.includes(o.value)}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                          if (checked) rhf.onChange([...arr, o.value])
                          else rhf.onChange(arr.filter((v) => v !== o.value))
                        }}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              )
            }
            case "terms":
              return (
                <label className="flex items-start gap-2.5 cursor-pointer text-[14px] text-base-700 dark:text-base-300">
                  <Checkbox checked={!!rhf.value} disabled={disabled} onCheckedChange={rhf.onChange} className="mt-0.5" />
                  <span>{field.label}{field.required && <span className="text-danger-500 ml-0.5">*</span>}</span>
                </label>
              )
            default:
              return <Input id={name} disabled={disabled} {...rhf} />
          }
        }}
      />
      <FieldError>{error}</FieldError>
    </div>
  )
}
