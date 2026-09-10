import { useState } from "react"
import { ChevronDown, CheckCircle2, PartyPopper } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { usePublicForm, useSubmitForm } from "@/lib/queries"
import { DynamicFormRenderer, type AnswerMap } from "./DynamicFormRenderer"
import { extractErrorMessage, extractFieldErrors } from "@/lib/apiClient"
import { cn } from "@/lib/utils"
import type { ActiveFormSummary, FormSubmissionDetail, FormSubmissionListItem } from "@/types/api"

interface Props {
  formSummary: ActiveFormSummary
  registrationOpen: boolean
  disabledMessage?: string
  existingSubmission?: FormSubmissionListItem
}

export function ActivityRegistrationCard({ formSummary, registrationOpen, disabledMessage, existingSubmission }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<FormSubmissionDetail | null>(null)

  const { data: form, isLoading } = usePublicForm(expanded ? formSummary.id : undefined)
  const submitMutation = useSubmitForm(formSummary.id)

  async function handleSubmit(answers: AnswerMap) {
    setFieldErrors({})
    try {
      const data = await submitMutation.mutateAsync(answers)
      setResult(data)
    } catch (err) {
      const fe = extractFieldErrors(err)
      if (Object.keys(fe).length) setFieldErrors(fe)
      else toast.error(extractErrorMessage(err))
    }
  }

  const alreadyRegistered = !!existingSubmission && !result

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => !alreadyRegistered && setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left",
          !alreadyRegistered && "cursor-pointer hover:bg-base-50 dark:hover:bg-base-800/30 transition-colors"
        )}
      >
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold">{formSummary.title}</h3>
          {formSummary.description && (
            <p className="text-sm text-base-600 dark:text-base-300/70 mt-1 line-clamp-2">{formSummary.description}</p>
          )}
        </div>
        {!alreadyRegistered && (
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-base-600 dark:text-base-300/60 transition-transform", expanded && "rotate-180")} />
        )}
      </button>

      {alreadyRegistered && existingSubmission && (
        <div className="px-5 sm:px-6 pb-6 -mt-2">
          <div className="flex items-center gap-2 text-success-500 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" /> You're already registered
          </div>
          <p className="mt-2 text-sm text-base-600 dark:text-base-300/60">
            Registration ID <span className="font-medium text-base-900 dark:text-base-100">{existingSubmission.registration_id}</span>
          </p>
          <Badge variant={existingSubmission.status === "approved" ? "success" : existingSubmission.status === "rejected" ? "danger" : "warning"} className="mt-2">
            {existingSubmission.status}
          </Badge>
        </div>
      )}

      {result && (
        <div className="px-5 sm:px-6 pb-6 -mt-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-500/10">
            <PartyPopper className="h-5 w-5 text-success-500" />
          </div>
          <p className="font-medium mt-3">Registered successfully!</p>
          <div className="mt-3 inline-flex flex-col items-center gap-1 rounded-2xl border border-base-200 dark:border-base-800 px-5 py-3">
            <span className="text-xs text-base-600 dark:text-base-300/60">Registration ID</span>
            <span className="font-display font-semibold">{result.registration_id}</span>
          </div>
          <p className="mt-3 text-xs text-base-600 dark:text-base-300/60">A confirmation email has been sent.</p>
        </div>
      )}

      {expanded && !result && !alreadyRegistered && (
        <div className="px-5 sm:px-6 pb-6 border-t border-base-100 dark:border-base-800 pt-5">
          {!registrationOpen ? (
            <p className="text-sm text-base-600 dark:text-base-300/70">{disabledMessage || "Registration is currently closed."}</p>
          ) : isLoading || !form ? (
            <div className="space-y-3"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
          ) : (
            <DynamicFormRenderer
              form={form}
              onSubmit={handleSubmit}
              submitting={submitMutation.isPending}
              serverFieldErrors={fieldErrors}
              submitLabel="Submit registration"
            />
          )}
        </div>
      )}

      {!expanded && !alreadyRegistered && !result && (
        <div className="px-5 sm:px-6 pb-5 -mt-1">
          <Button size="sm" variant="outline" onClick={() => setExpanded(true)}>
            {registrationOpen ? "Register" : "View details"}
          </Button>
        </div>
      )}
    </Card>
  )
}
