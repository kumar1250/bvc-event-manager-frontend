import { Check, Circle, CircleDot } from "lucide-react"
import type { EventFlowStep } from "@/types/api"
import { formatDate, formatTime, cn } from "@/lib/utils"

export function EventFlowTimeline({ steps }: { steps: EventFlowStep[] }) {
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  if (!sorted.length) return null

  return (
    <ol className="relative ml-3 border-l-2 border-base-200 dark:border-base-800 space-y-8">
      {sorted.map((step) => (
        <li key={step.id} className="relative pl-6">
          <span
            className={cn(
              "absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-base-50 dark:ring-base-950",
              step.status === "completed" && "bg-success-500 text-white",
              step.status === "in_progress" && "bg-accent-500 text-white",
              step.status === "pending" && "bg-base-200 dark:bg-base-800 text-base-600 dark:text-base-300"
            )}
          >
            {step.status === "completed" ? <Check className="h-3 w-3" /> : step.status === "in_progress" ? <CircleDot className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}
          </span>
          <p className={cn("font-medium text-[15px]", step.status === "pending" && "text-base-600 dark:text-base-300/70")}>{step.title}</p>
          {(step.date || step.time) && (
            <p className="text-xs text-base-600 dark:text-base-300/60 mt-0.5">
              {formatDate(step.date)} {step.time && `· ${formatTime(step.time)}`}
            </p>
          )}
          {step.description && <p className="text-sm text-base-600 dark:text-base-300/70 mt-1">{step.description}</p>}
        </li>
      ))}
    </ol>
  )
}
