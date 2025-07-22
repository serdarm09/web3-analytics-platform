import { cn } from "@/lib/utils"

interface PremiumSkeletonProps {
  className?: string
  lines?: number
  showAvatar?: boolean
}

export function PremiumSkeleton({ className, lines = 1, showAvatar = false }: PremiumSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-secondary h-12 w-12" />
          <div className="flex-1">
            <div className="h-4 bg-gray-secondary rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-secondary rounded w-1/2" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-secondary rounded",
            i !== lines - 1 && "mb-2",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  )
}