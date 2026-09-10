import { useState } from "react"
import { FileSpreadsheet, FileText, FileType } from "lucide-react"
import { useAdminEvents, useAdminForms } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { downloadExport } from "@/lib/downloadExport"

const formats = [
  { type: "csv", label: "CSV", icon: FileText },
  { type: "excel", label: "Excel", icon: FileSpreadsheet },
  { type: "pdf", label: "PDF", icon: FileType },
] as const

function FormatButtons({ onExport }: { onExport: (type: string) => void }) {
  return (
    <div className="flex gap-2 mt-4">
      {formats.map(({ type, label, icon: Icon }) => (
        <Button key={type} variant="outline" size="sm" onClick={() => onExport(type)}>
          <Icon className="h-4 w-4" /> {label}
        </Button>
      ))}
    </div>
  )
}

export default function AdminExportsPage() {
  const { data: events } = useAdminEvents()
  const { data: forms } = useAdminForms()
  const [eventId, setEventId] = useState<string>("")
  const [formId, setFormId] = useState<string>("")

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Exports</h1>
        <p className="mt-1.5 text-base-600 dark:text-base-300/70">Download registration data with columns generated from each form's actual fields.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All registrations</CardTitle>
          <CardDescription>Every registration across every event.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormatButtons onExport={(t) => downloadExport(`/registrations/export/?type=${t}`, `all_registrations.${t === "excel" ? "xlsx" : t}`)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By event</CardTitle>
          <CardDescription>All registrations for one event, across all its forms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
            <SelectContent>{events?.results.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
          <FormatButtons onExport={(t) => eventId && downloadExport(`/registrations/export/event/${eventId}/?type=${t}`, `event_${eventId}.${t === "excel" ? "xlsx" : t}`)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By form</CardTitle>
          <CardDescription>Responses for one specific registration form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={formId} onValueChange={setFormId}>
            <SelectTrigger><SelectValue placeholder="Choose a form" /></SelectTrigger>
            <SelectContent>{forms?.results.map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.title} — {f.event_name}</SelectItem>)}</SelectContent>
          </Select>
          <FormatButtons onExport={(t) => formId && downloadExport(`/forms/admin/${formId}/responses/export/?type=${t}`, `form_${formId}.${t === "excel" ? "xlsx" : t}`)} />
        </CardContent>
      </Card>
    </div>
  )
}
