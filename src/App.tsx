import { Routes, Route } from "react-router-dom"

import { PublicLayout } from "@/components/layout/PublicLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"

import LandingPage from "@/pages/public/LandingPage"
import EventsBrowsePage from "@/pages/public/EventsBrowsePage"
import EventDetailsPage from "@/pages/public/EventDetailsPage"
import CoordinatorsPage from "@/pages/public/CoordinatorsPage"
import NotFoundPage from "@/pages/NotFoundPage"

import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"

import StudentDashboardPage from "@/pages/student/StudentDashboardPage"
import MyRegistrationsPage from "@/pages/student/MyRegistrationsPage"
import MyRegistrationDetailPage from "@/pages/student/MyRegistrationDetailPage"
import ProfilePage from "@/pages/student/ProfilePage"

import CoordinatorDashboardPage from "@/pages/coordinator/CoordinatorDashboardPage"
import CoordinatorEventRegistrationsPage from "@/pages/coordinator/CoordinatorEventRegistrationsPage"

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import AdminEventsListPage from "@/pages/admin/AdminEventsListPage"
import AdminEventFormPage from "@/pages/admin/AdminEventFormPage"
import AdminEventFlowPage from "@/pages/admin/AdminEventFlowPage"
import AdminFormsListPage from "@/pages/admin/AdminFormsListPage"
import AdminFormBuilderPage from "@/pages/admin/AdminFormBuilderPage"
import AdminFormResponsesPage from "@/pages/admin/AdminFormResponsesPage"
import AdminRegistrationsPage from "@/pages/admin/AdminRegistrationsPage"
import AdminUsersPage from "@/pages/admin/AdminUsersPage"
import AdminCoordinatorsPage from "@/pages/admin/AdminCoordinatorsPage"
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage"
import AdminExportsPage from "@/pages/admin/AdminExportsPage"
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage"

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsBrowsePage />} />
        <Route path="/events/:slug" element={<EventDetailsPage />} />
        <Route path="/coordinators" element={<CoordinatorsPage />} />
      </Route>

      {/* Auth (no shared layout - AuthShell handles its own chrome) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Student */}
      <Route element={<ProtectedRoute roles={["user", "admin", "coordinator"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/my-registrations" element={<MyRegistrationsPage />} />
          <Route path="/my-registrations/:id" element={<MyRegistrationDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Coordinator */}
      <Route element={<ProtectedRoute roles={["coordinator", "admin"]} />}>
        <Route element={<AdminLayout role="coordinator" />}>
          <Route path="/coordinator" element={<CoordinatorDashboardPage />} />
          <Route path="/coordinator/events/:id/registrations" element={<CoordinatorEventRegistrationsPage />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AdminLayout role="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/events" element={<AdminEventsListPage />} />
          <Route path="/admin/events/create" element={<AdminEventFormPage />} />
          <Route path="/admin/events/:id/edit" element={<AdminEventFormPage />} />
          <Route path="/admin/events/:id/flow" element={<AdminEventFlowPage />} />
          <Route path="/admin/forms" element={<AdminFormsListPage />} />
          <Route path="/admin/forms/:id/builder" element={<AdminFormBuilderPage />} />
          <Route path="/admin/forms/:id/responses" element={<AdminFormResponsesPage />} />
          <Route path="/admin/registrations" element={<AdminRegistrationsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/coordinators" element={<AdminCoordinatorsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/exports" element={<AdminExportsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
