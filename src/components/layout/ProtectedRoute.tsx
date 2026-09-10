import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import type { Role } from "@/types/api"

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin" : user.role === "coordinator" ? "/coordinator" : "/dashboard"
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
