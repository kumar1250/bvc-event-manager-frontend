import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-base-200 bg-white px-3.5 py-2 text-[15px]",
        "placeholder:text-base-600/50 dark:placeholder:text-base-300/40",
        "outline-none transition-colors focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-base-800 dark:bg-base-900 dark:text-base-100",
        "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:ring-danger-500/10",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-base-200 bg-white px-3.5 py-2.5 text-[15px]",
        "placeholder:text-base-600/50 dark:placeholder:text-base-300/40",
        "outline-none transition-colors focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-base-800 dark:bg-base-900 dark:text-base-100",
        "aria-[invalid=true]:border-danger-500",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-base-900 dark:text-base-100", className)} {...props} />
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null
  return <p className="mt-1.5 text-[13px] text-danger-500">{children}</p>
}

export function HelpText({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="mt-1.5 text-[13px] text-base-600 dark:text-base-300/60">{children}</p>
}
