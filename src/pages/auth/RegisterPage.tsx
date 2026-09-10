import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { AuthShell } from "./AuthShell"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { extractErrorMessage } from "@/lib/apiClient"

interface FormValues {
  full_name: string
  email: string
  password: string
  confirm_password: string
}

export default function RegisterPage() {
  const { register: doRegister } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      await doRegister(values)
      toast.success("Account created — you're in!")
      navigate("/dashboard", { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Create an account" subtitle="Register once, join every event on campus.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" className="mt-1.5" aria-invalid={!!errors.full_name}
            {...register("full_name", { required: "Your name is required" })} />
          <FieldError>{errors.full_name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5" aria-invalid={!!errors.email}
            {...register("email", { required: "Email is required" })} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" className="mt-1.5" aria-invalid={!!errors.password}
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input id="confirm_password" type="password" autoComplete="new-password" className="mt-1.5" aria-invalid={!!errors.confirm_password}
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })} />
          <FieldError>{errors.confirm_password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-base-600 dark:text-base-300/70">
        Already have an account? <Link to="/login" className="font-medium text-accent-600 dark:text-accent-400 hover:underline">Log in</Link>
      </p>
    </AuthShell>
  )
}
