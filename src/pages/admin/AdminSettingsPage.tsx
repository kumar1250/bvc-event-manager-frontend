import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="mt-1.5 text-base-600 dark:text-base-300/70">Your account details for this admin session.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Signed in as</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-base-600 dark:text-base-300/70">
          Platform-wide settings (branding, SMTP, integrations) aren't backed by an API endpoint yet —
          this page is a placeholder until one exists. Manage your own profile from the account menu.
        </CardContent>
      </Card>
    </div>
  )
}
