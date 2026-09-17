// src/components/shared/InfiniteMarquee.tsx
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface InfiniteMarqueeProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  cleItem: (item: T, index: number) => string
  dureeSecondes?: number
  direction?: "gauche" | "droite"
  pauseAuSurvol?: boolean
  className?: string
  itemClassName?: string
}

// Bandeau defilant en boucle infinie (logos des partenaires/etablissements
// sur la vitrine publique). Pure CSS : la liste est dupliquee et translatee
// de -50%, aucune dependance externe.
export function InfiniteMarquee<T>({
  items,
  renderItem,
  cleItem,
  dureeSecondes = 30,
  direction = "gauche",
  pauseAuSurvol = true,
  className,
  itemClassName,
}: InfiniteMarqueeProps<T>) {
  if (items.length === 0) return null

  const itemsDoubles = [...items, ...items]

  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <style>{`
        @keyframes infinite-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className={cn(
          "flex w-max items-center gap-10",
          pauseAuSurvol && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `infinite-marquee-scroll ${dureeSecondes}s linear infinite`,
          animationDirection: direction === "droite" ? "reverse" : "normal",
        }}
      >
        {itemsDoubles.map((item, i) => (
          <div key={`${cleItem(item, i)}-${i}`} className={cn("shrink-0", itemClassName)}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {/* Fondus sur les bords pour un effet de sortie/entree propre */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}