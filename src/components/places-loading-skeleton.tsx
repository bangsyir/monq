import { Skeleton } from "@/components/ui/skeleton"

export function PlacesLoadingSkeleton() {
  return (
    <div className="container mx-auto py-6">
      {/* Table Skeleton */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="flex gap-4 border-b pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-4">
            <div className="flex-1">
              <Skeleton className="mb-2 h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
