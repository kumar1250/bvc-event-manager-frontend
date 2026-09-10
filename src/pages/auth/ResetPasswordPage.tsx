import { useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { AuthShell } from "./AuthShell"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiClient, extractErrorMessage } from "@/lib/apiClient"

interface FormValues { new_password: string; confirm_password: string }

export default function ResetPasswordPage() {
  const { token: tokenParam } = useParams()
  const [searchParams] = useSearchParams()
  const token = tokenParam || searchParams.get("token") || ""
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      await apiClient.post("/auth/reset-password/", { token, ...values })
      toast.success("Password updated — log in with your new password.")
      navigate("/login", { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is missing its token.">
        <Link to="/forgot-password"><Button className="w-full">Request a new link</Button></Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="new_password">New password</Label>
          <Input id="new_password" type="password" className="mt-1.5" aria-invalid={!!errors.new_password}
            {...register("new_password", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })} />
          <FieldError>{errors.new_password?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input id="confirm_password" type="password" className="mt-1.5" aria-invalid={!!errors.confirm_password}
            {...register("confirm_password", { required: "Required", validate: (v) => v === watch("new_password") || "Passwords do not match" })} />
          <FieldError>{errors.confirm_password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  )
}
