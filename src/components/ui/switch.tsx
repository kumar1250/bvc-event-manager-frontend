import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none",
      "data-[state=checked]:bg-accent-500 data-[state=unchecked]:bg-base-200 dark:data-[state=unchecked]:bg-base-700",
      "focus-visible:ring-2 focus-visible:ring-accent-500/30",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 translate-x-1 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-6" />
  </SwitchPrimitive.Root>
))
Switch.displayName = "Switch"
