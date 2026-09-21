// src/components/shared/RepartitionBars.tsx
import { cn } from "@/lib/utils"

interface RepartitionItem {
  statut: string
  libelle: string
  valeur: number
  pourcentage: number
  couleur: string
}

interface RepartitionBarsProps {
  items: RepartitionItem[]
  className?: string
}

export function RepartitionBars({ items, className }: RepartitionBarsProps) {
  const total = items.reduce((acc, item) => acc + item.valeur, 0)

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div key={item.statut} className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-foreground">{item.libelle}</span>
            <span className="font-data tabular-nums text-muted-foreground">
              {item.valeur}
              <span className="ml-1 text-[11px]">
                ({total > 0 ? Math.round((item.valeur / total) * 100) : 0}%)
              </span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${total > 0 ? (item.valeur / total) * 100 : 0}%`,
                backgroundColor: item.couleur,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
