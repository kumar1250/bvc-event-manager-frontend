import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function EventImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-accent-500/15 to-accent-400/5", className)}>
        <ImageOff className="h-6 w-6 text-accent-500/40" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />
}
