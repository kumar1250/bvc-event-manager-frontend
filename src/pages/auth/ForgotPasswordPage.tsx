import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { CheckCircle2 } from "lucide-react"
import { AuthShell } from "./AuthShell"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiClient, extractErrorMessage } from "@/lib/apiClient"
import { toast } from "sonner"

interface FormValues { email: string }

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      await apiClient.post("/auth/forgot-password/", values)
      setSent(true)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="We'll email you a link to reset it.">
      {sent ? (
        <div className="rounded-2xl border border-success-500/30 bg-success-500/5 p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success-500" />
          <p className="mt-3 font-medium">Check your inbox</p>
          <p className="mt-1 text-sm text-base-600 dark:text-base-300/70">
            If an account exists with that email, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-1.5" aria-invalid={!!errors.email}
              {...register("email", { required: "Email is required" })} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-base-600 dark:text-base-300/70">
        <Link to="/login" className="font-medium text-accent-600 dark:text-accent-400 hover:underline">Back to log in</Link>
      </p>
    </AuthShell>
  )
}
