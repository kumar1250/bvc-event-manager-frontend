import { Bell } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/queries"
import { cn } from "@/lib/utils"

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NotificationBell() {
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const unread = data?.results.filter((n) => !n.is_read).length ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white dark:ring-base-950" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-base-200 dark:border-base-800 px-4 py-3">
          <p className="font-display text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              className="text-xs text-accent-600 dark:text-accent-400 hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!data?.results.length && (
            <p className="px-4 py-8 text-center text-sm text-base-600 dark:text-base-300/60">
              You're all caught up.
            </p>
          )}
          {data?.results.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 border-b border-base-100 dark:border-base-800/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-base-50 dark:hover:bg-base-800/40",
                !n.is_read && "bg-accent-500/5"
              )}
            >
              <div className="flex w-full items-center gap-2">
                {!n.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />}
                <p className="text-sm font-medium">{n.title}</p>
              </div>
              {n.message && <p className="text-xs text-base-600 dark:text-base-300/60 line-clamp-2">{n.message}</p>}
              <p className="text-[11px] text-base-600/70 dark:text-base-300/40">{timeAgo(n.created_at)}</p>
            </button>
          ))}
        </div>
        <Link to="/dashboard" className="block border-t border-base-200 dark:border-base-800 px-4 py-2.5 text-center text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-base-50 dark:hover:bg-base-800/40">
          View dashboard
        </Link>
      </PopoverContent>
    </Popover>
  )
}
