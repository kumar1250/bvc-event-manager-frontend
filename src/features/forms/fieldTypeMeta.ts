import {
  Type, AlignLeft, Mail, Phone, Hash, CircleDot, CheckSquare, ChevronDown,
  ListChecks, Calendar, Clock, CalendarClock, Link2, MapPin, Image, Upload,
  Minus, Heading1, FileText, ShieldCheck, type LucideIcon,
} from "lucide-react"
import type { FieldType } from "@/types/api"

export const FIELD_TYPE_META: Record<FieldType, { label: string; icon: LucideIcon; group: string }> = {
  short_text: { label: "Short Text", icon: Type, group: "Text" },
  long_text: { label: "Long Text", icon: AlignLeft, group: "Text" },
  email: { label: "Email", icon: Mail, group: "Text" },
  phone: { label: "Phone", icon: Phone, group: "Text" },
  number: { label: "Number", icon: Hash, group: "Text" },
  radio: { label: "Radio", icon: CircleDot, group: "Selection" },
  checkbox: { label: "Checkbox", icon: CheckSquare, group: "Selection" },
  dropdown: { label: "Dropdown", icon: ChevronDown, group: "Selection" },
  multiselect: { label: "Multi Select", icon: ListChecks, group: "Selection" },
  date: { label: "Date", icon: Calendar, group: "Date/Time" },
  time: { label: "Time", icon: Clock, group: "Date/Time" },
  datetime: { label: "Date & Time", icon: CalendarClock, group: "Date/Time" },
  url: { label: "URL", icon: Link2, group: "Other" },
  address: { label: "Address", icon: MapPin, group: "Other" },
  image_url: { label: "Image URL", icon: Image, group: "Other" },
  file_upload: { label: "File Upload", icon: Upload, group: "Other" },
  section: { label: "Section", icon: Minus, group: "Layout" },
  heading: { label: "Heading", icon: Heading1, group: "Layout" },
  description: { label: "Description", icon: FileText, group: "Layout" },
  terms: { label: "Terms & Conditions", icon: ShieldCheck, group: "Layout" },
}

export const NON_INPUT_TYPES: FieldType[] = ["section", "heading", "description"]
export const OPTION_TYPES: FieldType[] = ["radio", "checkbox", "dropdown", "multiselect"]

export const FIELD_TYPE_GROUPS = ["Text", "Selection", "Date/Time", "Other", "Layout"] as const
