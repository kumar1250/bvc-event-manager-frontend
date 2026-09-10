import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Menu, Search, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "./NotificationBell"
import { initials } from "@/lib/utils"
import { cn } from "@/lib/utils"

const links = [
  { to: "/events", label: "Events" },
  { to: "/coordinators", label: "Coordinators" },
]

function roleHome(role?: string) {
  if (role === "admin") return "/admin"
  if (role === "coordinator") return "/coordinator"
  return "/dashboard"
}

export function PublicNavbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all",
        scrolled
          ? "border-b border-base-200/80 dark:border-base-800/80 bg-white/80 dark:bg-base-950/80 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500 text-white">F</span>
          Fest
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 text-sm font-medium text-base-700 dark:text-base-300 transition-colors hover:text-base-900 dark:hover:text-white",
                  "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:origin-left after:scale-x-0 after:bg-accent-500 after:transition-transform",
                  isActive && "text-base-900 dark:text-white after:scale-x-100"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-1.5">
          <Link to="/events">
            <Button variant="ghost" size="icon" aria-label="Search events">
              <Search className="h-[18px] w-[18px]" />
            </Button>
          </Link>
          <ThemeToggle />
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1">
                  <Avatar>
                    <AvatarImage src={user?.profile_image_url} />
                    <AvatarFallback>{initials(user?.full_name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{user?.full_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(roleHome(user?.role))}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                {user?.role === "user" && <DropdownMenuItem onClick={() => navigate("/my-registrations")}>My registrations</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    navigate("/")
                  }}
                  className="text-danger-500"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Sign up</Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-base-200 dark:border-base-800 bg-white dark:bg-base-950 px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-[15px] font-medium hover:bg-base-100 dark:hover:bg-base-900">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-base-600 dark:text-base-300/60">Theme</span>
            <ThemeToggle />
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => { setMobileOpen(false); navigate(roleHome(user?.role)) }}>Dashboard</Button>
                <Button variant="ghost" className="text-danger-500" onClick={() => { logout(); setMobileOpen(false); navigate("/") }}>Log out</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setMobileOpen(false); navigate("/login") }}>Log in</Button>
                <Button onClick={() => { setMobileOpen(false); navigate("/register") }}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
