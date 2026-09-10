import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Download } from "lucide-react"
import { useAdminFormBuilder, useFormResponses } from "@/lib/queries"
import { RegistrationsTable } from "@/features/registrations/RegistrationsTable"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { downloadExport } from "@/lib/downloadExport"

export default function AdminFormResponsesPage() {
  const { id } = useParams()
  const [page, setPage] = useState(1)
  const { data: form } = useAdminFormBuilder(id)
  const { data, isLoading } = useFormResponses(id, { page: String(page) })

  return (
    <div>
      <Link to="/admin/forms" className="inline-flex items-center gap-1.5 text-sm text-base-600 dark:text-base-300/60 hover:text-base-900 dark:hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to forms
      </Link>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{form?.title || "Responses"}</h1>
          <p className="mt-1.5 text-base-600 dark:text-base-300/70">{data?.count ?? 0} responses{form?.event_name && ` for ${form.event_name}`}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><Download className="h-4 w-4" /> Export</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            {(["csv", "excel", "pdf"] as const).map((t) => (
              <DropdownMenuItem key={t} onClick={() => downloadExport(`/forms/admin/${id}/responses/export/?type=${t}`, `responses.${t === "excel" ? "xlsx" : t}`)}>
                Export as {t.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 rounded-card" /><Skeleton className="h-16 rounded-card" /></div>
      ) : (
        <>
          <RegistrationsTable data={data?.results ?? []} showEvent={false} />
          {data && <Pagination page={page} onPageChange={setPage} hasNext={!!data.next} hasPrev={!!data.previous} total={data.count} />}
        </>
      )}
    </div>
  )
}
