import { useState } from "react"
import { Download } from "lucide-react"
import { useAdminEvents, useAdminRegistrations } from "@/lib/queries"
import { RegistrationsTable } from "@/features/registrations/RegistrationsTable"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { downloadExport } from "@/lib/downloadExport"

export default function AdminRegistrationsPage() {
  const [page, setPage] = useState(1)
  const [eventFilter, setEventFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { data: events } = useAdminEvents()
  const { data, isLoading } = useAdminRegistrations({
    page: String(page),
    event: eventFilter !== "all" ? eventFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">Registrations</h1>
          <p className="mt-1.5 text-base-600 dark:text-base-300/70">{data?.count ?? 0} registrations across all events.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><Download className="h-4 w-4" /> Export all</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            {(["csv", "excel", "pdf"] as const).map((t) => (
              <DropdownMenuItem key={t} onClick={() => downloadExport(`/registrations/export/?type=${t}`, `all_registrations.${t === "excel" ? "xlsx" : t}`)}>
                Export as {t.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 flex gap-3 flex-wrap">
        <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setPage(1) }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {events?.results.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-16 rounded-card" /><Skeleton className="h-16 rounded-card" /></div>
        ) : (
          <>
            <RegistrationsTable data={data?.results ?? []} />
            {data && <Pagination page={page} onPageChange={setPage} hasNext={!!data.next} hasPrev={!!data.previous} total={data.count} />}
          </>
        )}
      </div>
    </div>
  )
}
