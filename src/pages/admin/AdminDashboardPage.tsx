import { useEffect, useState } from "react"
import { CalendarDays, Users, ClipboardCheck, UserCog, FileText, Activity } from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useAdminDashboardStats } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const CHART_COLORS = ["#6D4AFF", "#8C74FF", "#B4A3FF", "#1FA97A", "#E0A324", "#E5484D"]

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    const duration = 600
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{display}</>
}

const cardMeta = [
  { key: "total_events", label: "Total Events", icon: CalendarDays },
  { key: "active_events", label: "Active Events", icon: Activity },
  { key: "total_users", label: "Total Users", icon: Users },
  { key: "total_registrations", label: "Total Registrations", icon: ClipboardCheck },
  { key: "total_coordinators", label: "Coordinators", icon: UserCog },
  { key: "active_forms", label: "Active Forms", icon: FileText },
] as const

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1.5 text-base-600 dark:text-base-300/70">A live snapshot of the whole platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />)
          : cardMeta.map(({ key, label, icon: Icon }) => (
              <Card key={key} className="p-4">
                <Icon className="h-5 w-5 text-accent-500" />
                <p className="font-display text-2xl font-semibold mt-2">
                  <CountUp value={data?.cards[key] ?? 0} />
                </p>
                <p className="text-xs text-base-600 dark:text-base-300/60 mt-0.5">{label}</p>
              </Card>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Registrations over time</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data?.charts.registrations_over_time}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6D4AFF" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Registrations by event</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.charts.registrations_by_event}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-800" />
                  <XAxis dataKey="event" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6D4AFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Registrations by category</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data?.charts.registrations_by_category} dataKey="count" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {data?.charts.registrations_by_category.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Department distribution</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : !data?.charts.department_distribution.length ? (
              <p className="text-sm text-base-600 dark:text-base-300/60 py-10 text-center">No department data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.charts.department_distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-800" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8C74FF" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
