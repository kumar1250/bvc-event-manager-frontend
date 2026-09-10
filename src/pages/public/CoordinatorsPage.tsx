import { Users } from "lucide-react"
import { useCoordinators } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/state-blocks"
import { Skeleton } from "@/components/ui/skeleton"
import { initials } from "@/lib/utils"

export default function CoordinatorsPage() {
  const { data, isLoading } = useCoordinators()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold">Coordinators</h1>
      <p className="mt-1.5 text-base-600 dark:text-base-300/70">The people running events on campus — reach out if you have questions.</p>

      <div className="mt-8">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-card" />)}
          </div>
        )}
        {!isLoading && !data?.results.length && <EmptyState icon={Users} title="No coordinators listed yet" />}
        {!isLoading && !!data?.results.length && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.results.map((c) => (
              <Card key={c.id} className="p-5 text-center">
                <Avatar className="mx-auto h-16 w-16">
                  <AvatarImage src={c.profile_image_url} />
                  <AvatarFallback className="text-lg">{initials(c.name)}</AvatarFallback>
                </Avatar>
                <p className="mt-3 font-medium">{c.name}</p>
                <p className="text-xs text-base-600 dark:text-base-300/60 mt-0.5">{c.designation}</p>
                <p className="text-xs text-base-600 dark:text-base-300/60">{c.department}</p>
                {c.bio && <p className="mt-2 text-xs text-base-600 dark:text-base-300/70 line-clamp-3">{c.bio}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
