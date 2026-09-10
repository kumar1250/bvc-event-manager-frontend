import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Pagination({ page, onPageChange, hasNext, hasPrev, total }: {
  page: number
  onPageChange: (p: number) => void
  hasNext: boolean
  hasPrev: boolean
  total?: number
  pageSize?: number
}) {
  if (!hasNext && !hasPrev && page === 1) return null
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-base-600 dark:text-base-300/60">
        {total != null ? `${total} total` : ""}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrev}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-sm px-2">{page}</span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={!hasNext}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
