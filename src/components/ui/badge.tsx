import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-base-100 text-base-800 dark:bg-base-800 dark:text-base-100",
        accent: "bg-accent-500/10 text-accent-600 dark:text-accent-400",
        success: "bg-success-500/10 text-success-500",
        warning: "bg-warning-500/10 text-warning-500",
        danger: "bg-danger-500/10 text-danger-500",
        outline: "border border-base-200 dark:border-base-800 text-base-700 dark:text-base-200",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
