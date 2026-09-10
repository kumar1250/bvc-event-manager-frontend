import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCoordinators, useEvents } from "@/lib/queries"
import { EventCard, EventCardSkeleton } from "@/features/events/EventCard"
import { EmptyState } from "@/components/ui/state-blocks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { initials } from "@/lib/utils"
import { Calendar } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState("")
  const { data: events, isLoading } = useEvents({ upcoming: "true" })
  const { data: coordinators } = useCoordinators()

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(q ? `/events?search=${encodeURIComponent(q)}` : "/events")
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-50 dark:opacity-30"
          style={{ background: "radial-gradient(closest-side, var(--color-accent-glow), transparent)" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]"
          >
            Discover. Register.
            <br />Experience.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base sm:text-lg text-base-600 dark:text-base-300/70 max-w-xl mx-auto"
          >
            Every hackathon, fest, and workshop on campus — searchable, with real seats and a registration form that actually works.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={onSearch}
            className="mt-8 mx-auto flex max-w-md items-center gap-2 rounded-full border border-base-200 dark:border-base-800 bg-white dark:bg-base-900 p-1.5 shadow-lg"
          >
            <Search className="ml-3 h-4 w-4 shrink-0 text-base-600 dark:text-base-300/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events, categories, venues…"
              className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-base-600/50 dark:placeholder:text-base-300/40"
            />
            <Button type="submit" size="sm" className="shrink-0">Search</Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-6"
          >
            <Button variant="outline" onClick={() => navigate("/events")}>
              Browse all events <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Happening soon</h2>
            <p className="text-sm text-base-600 dark:text-base-300/60 mt-1">Events open for registration right now.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/events")} className="hidden sm:inline-flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        )}
        {!isLoading && !events?.results.length && (
          <EmptyState icon={Calendar} title="No upcoming events yet" description="Check back soon — new events are added all the time." />
        )}
        {!isLoading && !!events?.results.length && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.results.slice(0, 6).map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Coordinators */}
      {!!coordinators?.results.length && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-display text-2xl font-semibold mb-6">Meet the coordinators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {coordinators.results.slice(0, 8).map((c) => (
              <Card key={c.id} className="p-4 text-center">
                <Avatar className="mx-auto h-14 w-14">
                  <AvatarImage src={c.profile_image_url} />
                  <AvatarFallback className="text-base">{initials(c.name)}</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-sm font-medium line-clamp-1">{c.name}</p>
                <p className="text-xs text-base-600 dark:text-base-300/60 line-clamp-1">{c.designation || c.department}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
