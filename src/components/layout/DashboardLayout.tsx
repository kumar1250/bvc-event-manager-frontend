import { Outlet } from "react-router-dom"
import { PublicNavbar } from "./PublicNavbar"

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
