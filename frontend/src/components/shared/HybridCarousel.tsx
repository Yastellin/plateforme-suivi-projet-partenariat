// src/components/shared/HybridCarousel.tsx
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HybridCarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  cleItem: (item: T, index: number) => string
  autoPlayMs?: number
  showControls?: boolean
  showDots?: boolean
  className?: string
}

// Carrousel "hybride" : defilement automatique + navigation manuelle
// (boutons, points, glissement tactile). Pas de dependance externe —
// utilise pour la galerie de photos des publications et les partenaires
// a la une sur la vitrine publique.
export function HybridCarousel<T>({
  items,
  renderItem,
  cleItem,
  autoPlayMs = 5000,
  showControls = true,
  showDots = true,
  className,
}: HybridCarouselProps<T>) {
  const [index, setIndex] = useState(0)
  const [enPause, setEnPause] = useState(false)
  const refDebutGlissement = useRef<number | null>(null)

  const aller = useCallback(
    (nouvelIndex: number) => {
      const total = items.length
      setIndex(((nouvelIndex % total) + total) % total)
    },
    [items.length]
  )

  const suivant = useCallback(() => aller(index + 1), [aller, index])
  const precedent = useCallback(() => aller(index - 1), [aller, index])

  useEffect(() => {
    if (enPause || items.length <= 1 || !autoPlayMs) return
    const minuteur = setInterval(() => aller(index + 1), autoPlayMs)
    return () => clearInterval(minuteur)
  }, [index, enPause, autoPlayMs, items.length, aller])

  if (items.length === 0) return null

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onPointerDown={(e) => {
        refDebutGlissement.current = e.clientX
        setEnPause(true)
      }}
      onPointerUp={(e) => {
        if (refDebutGlissement.current === null) return
        const delta = e.clientX - refDebutGlissement.current
        if (delta > 50) precedent()
        else if (delta < -50) suivant()
        refDebutGlissement.current = null
        setEnPause(false)
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((item, i) => (
          <div key={cleItem(item, i)} className="w-full shrink-0">
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {showControls && items.length > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
            onClick={precedent}
            aria-label="Élément précédent"
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
            onClick={suivant}
            aria-label="Élément suivant"
          >
            <ChevronRight size={18} />
          </Button>
        </>
      )}

      {showDots && items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((item, i) => (
            <button
              key={cleItem(item, i)}
              type="button"
              aria-label={`Aller à l'élément ${i + 1}`}
              onClick={() => aller(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-background/60 transition-all",
                i === index && "w-4 bg-background"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}