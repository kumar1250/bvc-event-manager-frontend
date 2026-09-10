import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, CalendarDays, ClipboardList, Users, UserCog, BarChart3,
  Download, Settings, Menu, X, LogOut,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "./NotificationBell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials, cn } from "@/lib/utils"

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/forms", label: "Forms", icon: ClipboardList },
  { to: "/admin/registrations", label: "Registrations", icon: Users },
  { to: "/admin/coordinators", label: "Coordinators", icon: UserCog },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/exports", label: "Exports", icon: Download },
  { to: "/admin/settings", label: "Settings", icon: Settings },
]

// Primary tabs shown on the mobile bottom bar; the rest live in the drawer.
const mobilePrimary = navItems.slice(0, 4)

function SidebarLink({ to, label, icon: Icon, end, onClick }: (typeof navItems)[number] & { onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
          isActive
            ? "bg-accent-500/10 text-accent-600 dark:text-accent-400"
            : "text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-900"
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
    </NavLink>
  )
}

export function AdminLayout({ role = "admin" as "admin" | "coordinator" }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const items = role === "coordinator"
    ? [
        { to: "/coordinator", label: "Dashboard", icon: LayoutDashboard, end: true },
      ]
    : navItems

  return (
    <div className="min-h-screen bg-base-50 dark:bg-base-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-base-200 dark:border-base-800 bg-white dark:bg-base-900/40">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 font-display text-lg font-semibold border-b border-base-200 dark:border-base-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500 text-white">F</span>
          Fest {role === "admin" ? "Admin" : "Coordinator"}
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => <SidebarLink key={item.to} {...item} />)}
        </nav>
        <div className="border-t border-base-200 dark:border-base-800 p-3">
          <button
            onClick={() => { logout(); navigate("/") }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-danger-500 hover:bg-danger-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-base-200 dark:border-base-800 bg-white/80 dark:bg-base-950/80 backdrop-blur-lg px-4 sm:px-6">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell />
            <Avatar className="ml-1">
              <AvatarImage src={user?.profile_image_url} />
              <AvatarFallback>{initials(user?.full_name)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 sm:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex border-t border-base-200 dark:border-base-800 bg-white/95 dark:bg-base-950/95 backdrop-blur-lg">
        {mobilePrimary.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium min-h-[52px] justify-center",
                isActive ? "text-accent-600 dark:text-accent-400" : "text-base-600 dark:text-base-300/60"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium min-h-[52px] justify-center text-base-600 dark:text-base-300/60"
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Mobile drawer (full nav) */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-base-950 border-r border-base-200 dark:border-base-800 animate-slide-in-left flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-base-200 dark:border-base-800">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1.5 rounded-full hover:bg-base-100 dark:hover:bg-base-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {items.map((item) => <SidebarLink key={item.to} {...item} onClick={() => setDrawerOpen(false)} />)}
            </nav>
            <div className="border-t border-base-200 dark:border-base-800 p-3">
              <button
                onClick={() => { logout(); navigate("/") }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-danger-500 hover:bg-danger-500/10"
              >
                <LogOut className="h-[18px] w-[18px]" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
