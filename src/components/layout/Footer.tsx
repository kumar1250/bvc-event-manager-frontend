import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-base-200 dark:border-base-800 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-500 text-white text-xs">BVC</span>
        </Link>
        <p className="text-sm text-base-600 dark:text-base-300/60">Discover, register, and experience campus events.</p>
        <div className="flex gap-5 text-sm text-base-600 dark:text-base-300/60">
          <Link to="/events" className="hover:text-base-900 dark:hover:text-white">Events</Link>
          <Link to="/coordinators" className="hover:text-base-900 dark:hover:text-white">Coordinators</Link>
        </div>
      </div>
    </footer>
  )
}
