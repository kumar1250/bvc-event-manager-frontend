import type { LucideIcon } from "lucide-react"
import { Inbox, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-base-200 dark:border-base-800 px-6 py-16 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-100 dark:bg-base-900">
        <Icon className="h-5 w-5 text-base-600 dark:text-base-300/60" />
      </div>
      <p className="font-display text-base font-medium">{title}</p>
      {description && <p className="max-w-xs text-sm text-base-600 dark:text-base-300/60">{description}</p>}
      {action && (
        <Button size="sm" variant="outline" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({
  title = "Couldn't load this",
  description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-danger-500/20 bg-danger-500/5 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-500/10">
        <AlertTriangle className="h-5 w-5 text-danger-500" />
      </div>
      <p className="font-display text-base font-medium">{title}</p>
      {description && <p className="max-w-xs text-sm text-base-600 dark:text-base-300/60">{description}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  )
}
