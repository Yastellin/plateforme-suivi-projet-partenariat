// src/components/shared/SkeletonTable.tsx
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonTableProps {
  lignes?: number
  colonnes?: number
}

export function SkeletonTable({ lignes = 5, colonnes = 5 }: SkeletonTableProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: colonnes }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: lignes }).map((_, ligne) => (
        <div key={ligne} className="flex gap-4">
          {Array.from({ length: colonnes }).map((_, col) => (
            <Skeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
