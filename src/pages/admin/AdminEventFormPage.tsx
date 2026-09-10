import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Textarea, Label, FieldError, HelpText } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAdminEvent, useCreateEvent, useUpdateEvent } from "@/lib/queries"
import { extractErrorMessage } from "@/lib/apiClient"
import { Link } from "react-router-dom"

interface FormValues {
  name: string
  description: string
  category: string
  banner_image_url: string
  date: string
  start_time: string
  end_time: string
  venue: string
  registration_start: string
  registration_end: string
  max_participants: string
  status: string
  instructions: string
}

const categories = ["technical", "cultural", "sports", "literary", "workshop", "other"]
const statuses = ["draft", "upcoming", "registration_open", "registration_closed", "ongoing", "completed", "cancelled"]

export default function AdminEventFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { data: existing, isLoading } = useAdminEvent(id)
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent(id ?? "")

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { category: "other", status: "draft" },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description,
        category: existing.category,
        banner_image_url: existing.banner_image_url,
        date: existing.date,
        start_time: existing.start_time?.slice(0, 5),
        end_time: existing.end_time?.slice(0, 5) || "",
        venue: existing.venue,
        registration_start: existing.registration_start?.slice(0, 16) || "",
        registration_end: existing.registration_end?.slice(0, 16) || "",
        max_participants: existing.max_participants != null ? String(existing.max_participants) : "",
        status: existing.status,
        instructions: existing.instructions,
      })
    }
  }, [existing, reset])

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      end_time: values.end_time || null,
      registration_start: values.registration_start || null,
      registration_end: values.registration_end || null,
      max_participants: values.max_participants ? Number(values.max_participants) : null,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success("Event updated")
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success("Event created")
        navigate(`/admin/events/${created.id}/flow`)
        return
      }
      navigate("/admin/events")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  if (isEdit && isLoading) return <p className="text-sm text-base-600 dark:text-base-300/60">Loading…</p>

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="max-w-2xl">
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-base-600 dark:text-base-300/60 hover:text-base-900 dark:hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-6">{isEdit ? "Edit event" : "Create event"}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Event name</Label>
              <Input id="name" className="mt-1.5" {...register("name", { required: "Required" })} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" {...register("description")} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="banner_image_url">Banner image URL</Label>
              <Input id="banner_image_url" className="mt-1.5" placeholder="https://drive.google.com/file/d/…/view or any image URL" {...register("banner_image_url")} />
              <HelpText>Public Google Drive share links are converted automatically.</HelpText>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="mt-1.5" {...register("date", { required: "Required" })} />
                <FieldError>{errors.date?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="start_time">Start time</Label>
                <Input id="start_time" type="time" className="mt-1.5" {...register("start_time", { required: "Required" })} />
                <FieldError>{errors.start_time?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="end_time">End time</Label>
                <Input id="end_time" type="time" className="mt-1.5" {...register("end_time")} />
              </div>
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" className="mt-1.5" {...register("venue")} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration_start">Registration opens</Label>
                <Input id="registration_start" type="datetime-local" className="mt-1.5" {...register("registration_start")} />
              </div>
              <div>
                <Label htmlFor="registration_end">Registration closes</Label>
                <Input id="registration_end" type="datetime-local" className="mt-1.5" {...register("registration_end")} />
              </div>
            </div>
            <div>
              <Label htmlFor="max_participants">Max participants</Label>
              <Input id="max_participants" type="number" min={0} className="mt-1.5" placeholder="Leave blank for unlimited" {...register("max_participants")} />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea id="instructions" className="mt-1.5" placeholder="Shown to registrants and in the confirmation email" {...register("instructions")} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : isEdit ? "Save changes" : "Create event"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/events")}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
