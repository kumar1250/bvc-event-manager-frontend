import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => <RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-2.5", className)} {...props} />)
RadioGroup.displayName = "RadioGroup"

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "h-5 w-5 shrink-0 rounded-full border border-base-300 dark:border-base-700 outline-none",
      "data-[state=checked]:border-[5px] data-[state=checked]:border-accent-500",
      "focus-visible:ring-2 focus-visible:ring-accent-500/30",
      className
    )}
    {...props}
  />
))
RadioGroupItem.displayName = "RadioGroupItem"
