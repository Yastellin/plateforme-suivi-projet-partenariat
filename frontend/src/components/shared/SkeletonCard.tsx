// src/components/shared/SkeletonCard.tsx
import { Skeleton } from "@/components/ui/skeleton"

// Carte de chargement squelettique - jamais un spinner plein ecran seul
// (section 8 : skeleton loading sur tout chargement serveur).
export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}
