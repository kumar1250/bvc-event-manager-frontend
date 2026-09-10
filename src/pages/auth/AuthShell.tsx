import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-base-900 p-10 text-white">
        <div className="absolute inset-0 opacity-70" style={{
          background: "radial-gradient(60% 50% at 20% 20%, rgba(140,116,255,0.5), transparent), radial-gradient(50% 40% at 90% 80%, rgba(109,74,255,0.35), transparent)"
        }} />
        <Link to="/" className="relative flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500">F</span>
          Fest
        </Link>
        <div className="relative">
          <p className="font-display text-3xl font-semibold leading-tight max-w-sm">
            Discover. Register. Experience.
          </p>
          <p className="mt-3 max-w-sm text-white/70">
            Every hackathon, fest, and workshop on campus — in one place, with real-time seats and a form that gets you registered in seconds.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-display text-lg font-semibold mb-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500 text-white">F</span>
            Fest
          </Link>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-base-600 dark:text-base-300/70">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
