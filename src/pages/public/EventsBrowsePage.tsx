import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, CalendarX } from "lucide-react"
import { useEvents } from "@/lib/queries"
import { EventCard, EventCardSkeleton } from "@/features/events/EventCard"
import { EmptyState, ErrorState } from "@/components/ui/state-blocks"
import { cn } from "@/lib/utils"
import type { EventCategory, EventStatus } from "@/types/api"

const categoryChips: { value: EventCategory | ""; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "technical", label: "Technical" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "literary", label: "Literary" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
]

const statusChips: { value: EventStatus | "" | "upcoming_only"; label: string }[] = [
  { value: "", label: "All" },
  { value: "registration_open", label: "Registration Open" },
  { value: "registration_closed", label: "Registration Closed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
]

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors min-h-[36px]",
        active
          ? "border-accent-500 bg-accent-500 text-white"
          : "border-base-200 dark:border-base-800 text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-900"
      )}
    >
      {children}
    </button>
  )
}

export default function EventsBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const category = searchParams.get("category") || ""
  const status = searchParams.get("status") || ""

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (searchInput) next.set("search", searchInput)
      else next.delete("search")
      setSearchParams(next, { replace: true })
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const params = useMemo(() => {
    const p: Record<string, string | undefined> = { search: searchParams.get("search") || undefined }
    if (category) p.category = category
    if (status) p.status = status
    return p
  }, [searchParams, category, status])

  const { data, isLoading, isError, refetch } = useEvents(params)

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold">Browse events</h1>
      <p className="mt-1.5 text-base-600 dark:text-base-300/70">Find what's happening and grab a seat before it fills up.</p>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-base-200 dark:border-base-800 bg-white dark:bg-base-900 px-4 py-2.5 max-w-md">
        <Search className="h-4 w-4 shrink-0 text-base-600 dark:text-base-300/50" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search events…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-base-600/50 dark:placeholder:text-base-300/40"
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {statusChips.map((c) => (
          <Chip key={c.value} active={status === c.value} onClick={() => setParam("status", c.value)}>{c.label}</Chip>
        ))}
      </div>
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categoryChips.map((c) => (
          <Chip key={c.value} active={category === c.value} onClick={() => setParam("category", c.value)}>{c.label}</Chip>
        ))}
      </div>

      <div className="mt-8">
        {isError && <ErrorState onRetry={() => refetch()} />}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        )}
        {!isLoading && !isError && !data?.results.length && (
          <EmptyState icon={CalendarX} title="No events match your filters" description="Try a different search term or clear the filters." />
        )}
        {!isLoading && !!data?.results.length && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.results.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}
