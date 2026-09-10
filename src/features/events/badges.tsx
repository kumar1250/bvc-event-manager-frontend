import { Badge } from "@/components/ui/badge"
import type { EventCategory, EventStatus, FormStatus, SubmissionStatus } from "@/types/api"

const statusMeta: Record<EventStatus, { label: string; variant: "neutral" | "accent" | "success" | "warning" | "danger" | "outline" }> = {
  draft: { label: "Draft", variant: "neutral" },
  upcoming: { label: "Upcoming", variant: "accent" },
  registration_open: { label: "Registration Open", variant: "success" },
  registration_closed: { label: "Registration Closed", variant: "warning" },
  ongoing: { label: "Ongoing", variant: "accent" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "danger" },
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const meta = statusMeta[status] ?? statusMeta.draft
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

const categoryLabels: Record<EventCategory, string> = {
  technical: "Technical",
  cultural: "Cultural",
  sports: "Sports",
  literary: "Literary",
  workshop: "Workshop",
  other: "Other",
}
export function CategoryBadge({ category }: { category: EventCategory }) {
  return <Badge variant="outline">{categoryLabels[category] ?? category}</Badge>
}

const formStatusMeta: Record<FormStatus, { label: string; variant: "neutral" | "success" | "warning" | "danger" }> = {
  draft: { label: "Draft", variant: "neutral" },
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "warning" },
  closed: { label: "Closed", variant: "danger" },
}
export function FormStatusBadge({ status }: { status: FormStatus }) {
  const meta = formStatusMeta[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

const submissionStatusMeta: Record<SubmissionStatus, { label: string; variant: "warning" | "success" | "danger" }> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
}
export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const meta = submissionStatusMeta[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
