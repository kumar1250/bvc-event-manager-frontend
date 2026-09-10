import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
        <Compass className="h-7 w-7 text-accent-500" />
      </div>
      <h1 className="font-display text-3xl font-semibold mt-5">Page not found</h1>
      <p className="mt-2 text-base-600 dark:text-base-300/70 max-w-sm">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/"><Button className="mt-6">Back to home</Button></Link>
    </div>
  )
}
