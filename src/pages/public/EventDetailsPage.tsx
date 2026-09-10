import { useParams } from "react-router-dom"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEvent, useMyRegistrations } from "@/lib/queries"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/state-blocks"
import { Card } from "@/components/ui/card"
import { EventStatusBadge, CategoryBadge } from "@/features/events/badges"
import { EventImage } from "@/features/events/EventImage"
import { EventFlowTimeline } from "@/features/events/EventFlowTimeline"
import { ActivityRegistrationCard } from "@/features/forms/ActivityRegistrationCard"
import { formatDate, formatTime, initials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function EventDetailsPage() {
  const { slug } = useParams()
  const { data: event, isLoading, isError, refetch } = useEvent(slug)
  const { isAuthenticated } = useAuth()
  const { data: myRegistrations } = useMyRegistrations()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-64 w-full rounded-card" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
  if (isError || !event) return <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16"><ErrorState onRetry={() => refetch()} /></div>

  const disabledMessage =
    event.status === "cancelled" ? "This event has been cancelled."
      : event.is_full ? "Registration is full for this event."
      : "Registration is currently closed."

  return (
    <div>
      <div className="aspect-[21/9] w-full max-h-[420px] overflow-hidden bg-base-100 dark:bg-base-900">
        <EventImage src={event.banner_image_url} alt={event.name} className="h-full w-full object-cover" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-10 relative">
        <Card className="p-5 sm:p-8">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={event.category} />
            <EventStatusBadge status={event.status} />
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold mt-3">{event.name}</h1>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-base-700 dark:text-base-300">
              <CalendarDays className="h-4 w-4 text-accent-500 shrink-0" /> {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-2 text-base-700 dark:text-base-300">
              <Clock className="h-4 w-4 text-accent-500 shrink-0" /> {formatTime(event.start_time)}{event.end_time && ` – ${formatTime(event.end_time)}`}
            </div>
            {event.venue && (
              <div className="flex items-center gap-2 text-base-700 dark:text-base-300 sm:col-span-2">
                <MapPin className="h-4 w-4 text-accent-500 shrink-0" /> {event.venue}
              </div>
            )}
            {event.max_participants != null && (
              <div className="flex items-center gap-2 text-base-700 dark:text-base-300">
                <Users className="h-4 w-4 text-accent-500 shrink-0" />
                {event.is_full ? <span className="font-medium text-danger-500">Registration Full</span> : `${event.registration_count}/${event.max_participants} registered — ${event.seats_remaining} left`}
              </div>
            )}
          </div>

          {event.description && <p className="mt-6 text-[15px] leading-relaxed text-base-700 dark:text-base-300 whitespace-pre-line">{event.description}</p>}

          {!!event.coordinators.length && (
            <div className="mt-6 flex flex-wrap gap-4">
              {event.coordinators.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5">
                  <Avatar>
                    <AvatarImage src={c.profile_image_url} />
                    <AvatarFallback>{initials(c.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-tight">{c.name}</p>
                    <p className="text-xs text-base-600 dark:text-base-300/60 leading-tight">{c.designation || c.department}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {!!event.flow_steps.length && (
          <Card className="p-5 sm:p-8 mt-6">
            <h2 className="font-display text-xl font-semibold mb-6">Event flow</h2>
            <EventFlowTimeline steps={event.flow_steps} />
          </Card>
        )}

        <div className="mt-6 mb-16 space-y-4" id="register">
          <h2 className="font-display text-xl font-semibold px-1">
            {event.active_forms.length > 1 ? "Activities" : "Register"}
          </h2>
          {!event.active_forms.length ? (
            <Card className="p-6"><p className="text-sm text-base-600 dark:text-base-300/70">Registration isn't open for this event yet.</p></Card>
          ) : (
            event.active_forms.map((formSummary) => (
              <ActivityRegistrationCard
                key={formSummary.id}
                formSummary={formSummary}
                registrationOpen={event.is_registration_open}
                disabledMessage={disabledMessage}
                existingSubmission={
                  isAuthenticated
                    ? myRegistrations?.results.find((r) => r.form === formSummary.id)
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
