import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/context/ThemeContext"

export function Toaster() {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "rounded-2xl! border! border-base-200! dark:border-base-800! font-body!",
        },
      }}
    />
  )
}
