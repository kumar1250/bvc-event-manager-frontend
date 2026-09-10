import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] min-h-[44px] px-5",
  {
    variants: {
      variant: {
        primary: "bg-accent-500 text-white shadow-[0_1px_0_rgba(0,0,0,0.05),0_8px_20px_-8px_var(--color-accent-500)] hover:bg-accent-600",
        secondary: "bg-base-900 text-base-50 hover:bg-base-800 dark:bg-base-100 dark:text-base-900 dark:hover:bg-white",
        outline: "border border-base-300 dark:border-base-800 bg-transparent hover:bg-base-100 dark:hover:bg-base-900",
        ghost: "bg-transparent hover:bg-base-100 dark:hover:bg-base-900",
        danger: "bg-danger-500 text-white hover:opacity-90",
        link: "bg-transparent underline-offset-4 hover:underline px-0 min-h-0",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-[13px] min-h-[36px]",
        lg: "h-[52px] px-7 text-base",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"
