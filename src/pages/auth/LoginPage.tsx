import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { AuthShell } from "./AuthShell"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { extractErrorMessage } from "@/lib/apiClient"
import type { User } from "@/types/api"

interface FormValues { email: string; password: string }

function roleHome(role?: string) {
  if (role === "admin") return "/admin"
  if (role === "coordinator") return "/coordinator"
  return "/dashboard"
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const user: User = await login(values.email, values.password)
      toast.success("Welcome back!")
      const from = (location.state as { from?: Location })?.from?.pathname
      navigate(from || roleHome(user.role), { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Log in" subtitle="Welcome back — let's get you to the good stuff.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5" aria-invalid={!!errors.email}
            {...register("email", { required: "Email is required" })} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-accent-600 dark:text-accent-400 hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" className="mt-1.5" aria-invalid={!!errors.password}
            {...register("password", { required: "Password is required" })} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-base-600 dark:text-base-300/70">
        New here? <Link to="/register" className="font-medium text-accent-600 dark:text-accent-400 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  )
}
