import { Trophy } from "lucide-react"
import { useAdminDashboardStats } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="mt-1.5 text-base-600 dark:text-base-300/70">Deeper look at what's popular across the platform.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Most popular events</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-64 w-full" /> : !data?.charts.popular_events.length ? (
            <p className="text-sm text-base-600 dark:text-base-300/60 py-10 text-center">No registrations yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.charts.popular_events} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-800" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Bar dataKey="reg_count" fill="#6D4AFF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        {data?.charts.popular_events.slice(0, 3).map((e, i) => (
          <Card key={e.name} className="p-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10">
              <Trophy className="h-5 w-5 text-accent-500" />
            </div>
            <div>
              <p className="text-sm font-medium">#{i + 1} {e.name}</p>
              <p className="text-xs text-base-600 dark:text-base-300/60">{e.reg_count} registrations</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
