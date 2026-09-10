export type Role = "admin" | "coordinator" | "user"

export interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: Role
  is_active_account: boolean
  profile_image_url: string
  date_joined: string
}

export type EventCategory = "technical" | "cultural" | "sports" | "literary" | "workshop" | "other"
export type EventStatus =
  | "draft" | "upcoming" | "registration_open" | "registration_closed"
  | "ongoing" | "completed" | "cancelled"

export interface EventListItem {
  id: number
  name: string
  slug: string
  category: EventCategory
  banner_image_url: string
  date: string
  start_time: string
  end_time: string | null
  venue: string
  status: EventStatus
  max_participants: number | null
  registration_count: number
  seats_remaining: number | null
  is_full: boolean
  is_registration_open: boolean
}

export interface EventFlowStep {
  id: number
  title: string
  description: string
  date: string | null
  time: string | null
  order: number
  status: "pending" | "in_progress" | "completed"
}

export interface CoordinatorMini {
  id: number
  name: string
  department: string
  designation: string
  profile_image_url: string
  bio?: string
}

export interface ActiveFormSummary {
  id: number
  title: string
  description: string
}

export interface EventDetail extends EventListItem {
  description: string
  registration_start: string | null
  registration_end: string | null
  instructions: string
  flow_steps: EventFlowStep[]
  coordinators: CoordinatorMini[]
  active_form_id: number | null
  active_forms: ActiveFormSummary[]
  created_at: string
  updated_at: string
}

export type FieldType =
  | "short_text" | "long_text" | "email" | "phone" | "number"
  | "radio" | "checkbox" | "dropdown" | "multiselect"
  | "date" | "time" | "datetime"
  | "url" | "address" | "image_url" | "file_upload"
  | "section" | "heading" | "description" | "terms"

export interface FieldOption {
  id?: number
  label: string
  value: string
  order: number
}

export interface FormField {
  id?: number
  label: string
  field_type: FieldType
  placeholder?: string
  description?: string
  required: boolean
  default_value?: string
  min_length?: number | null
  max_length?: number | null
  min_value?: number | null
  max_value?: number | null
  validation_regex?: string
  order: number
  options?: FieldOption[]
  depends_on_field?: number | null
  depends_on_value?: string
}

export type FormStatus = "draft" | "active" | "inactive" | "closed"

export interface RegistrationForm {
  id: number
  event: number
  event_name?: string
  title: string
  description: string
  status: FormStatus
  fields: FormField[]
  created_at?: string
  updated_at?: string
}

export interface RegistrationFormListItem {
  id: number
  event: number
  event_name: string
  title: string
  status: FormStatus
  field_count: number
  submission_count: number
  updated_at: string
}

export type SubmissionStatus = "pending" | "approved" | "rejected"

export interface FormAnswer {
  field: number
  field_label: string
  field_type: FieldType
  value: string
}

export interface FormSubmissionListItem {
  id: number
  registration_id: string
  event: number
  event_name: string
  form: number
  form_title: string
  name: string
  email: string
  status: SubmissionStatus
  submitted_at: string
}

export interface FormSubmissionDetail extends FormSubmissionListItem {
  answers: FormAnswer[]
  answers_dict: Record<string, string>
  updated_at: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DashboardStats {
  cards: {
    total_events: number
    active_events: number
    total_users: number
    total_registrations: number
    total_coordinators: number
    active_forms: number
  }
  charts: {
    registrations_over_time: { date: string; count: number }[]
    registrations_by_event: { event: string; count: number }[]
    registrations_by_category: { category: string; count: number }[]
    department_distribution: { department: string; count: number }[]
    popular_events: { name: string; reg_count: number }[]
  }
}
