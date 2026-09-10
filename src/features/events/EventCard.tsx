import { Link } from "react-router-dom"
import { MapPin, Users } from "lucide-react"
import type { EventListItem } from "@/types/api"
import { Card } from "@/components/ui/card"
import { EventStatusBadge, CategoryBadge } from "./badges"
import { formatDate, formatTime } from "@/lib/utils"
import { EventImage } from "./EventImage"

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Link to={`/events/${event.slug}`} className="group block">
      <Card className="overflow-hidden h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="aspect-[16/10] w-full overflow-hidden bg-base-100 dark:bg-base-800">
          <EventImage
            src={event.banner_image_url}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={event.category} />
            <EventStatusBadge status={event.status} />
          </div>
          <h3 className="font-display text-lg font-semibold mt-2.5 line-clamp-1">{event.name}</h3>
          <div className="mt-2 space-y-1 text-sm text-base-600 dark:text-base-300/70">
            <p>{formatDate(event.date)} · {formatTime(event.start_time)}</p>
            {event.venue && (
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="line-clamp-1">{event.venue}</span></p>
            )}
          </div>
          {event.max_participants != null && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-base-600 dark:text-base-300/60">
              <Users className="h-3.5 w-3.5" />
              {event.is_full ? (
                <span className="font-medium text-danger-500">Full</span>
              ) : (
                <span>{event.seats_remaining} seat{event.seats_remaining === 1 ? "" : "s"} left</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/10] w-full bg-base-100 dark:bg-base-800 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-24 rounded-full bg-base-100 dark:bg-base-800 animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-base-100 dark:bg-base-800 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-base-100 dark:bg-base-800 animate-pulse" />
      </div>
    </Card>
  )
}
