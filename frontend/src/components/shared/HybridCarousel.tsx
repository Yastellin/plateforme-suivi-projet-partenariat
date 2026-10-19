// src/components/shared/HybridCarousel.tsx
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
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
  libelle?: string
  className?: string
}

// Carrousel accessible : defilement automatique (suspendu au survol, au focus,
// au glissement et si l'utilisateur demande moins d'animations), navigation
// manuelle (boutons, points, fleches du clavier, glissement tactile).
// Pas de dependance externe. Utilise pour les publications, les projets et
// les partenaires a la une de la vitrine publique.
export function HybridCarousel<T>({
  items,
  renderItem,
  cleItem,
  autoPlayMs = 6000,
  showControls = true,
  showDots = true,
  libelle = "Carrousel",
  className,
}: HybridCarouselProps<T>) {
  const [indexBrut, setIndex] = useState(0)
  const [survol, setSurvol] = useState(false)
  const [focus, setFocus] = useState(false)
  const [glissement, setGlissement] = useState(false)
  const refDebutGlissement = useRef<number | null>(null)
  const refMouvementReduit = useRef(false)

  useEffect(() => {
    refMouvementReduit.current =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  }, [])

  const total = items.length
  // Index derive : si la liste raccourcit, on revient au premier element sans effet.
  const index = indexBrut < total ? indexBrut : 0
  const aller = useCallback(
    (nouvelIndex: number) => {
      if (total === 0) return
      setIndex(((nouvelIndex % total) + total) % total)
    },
    [total]
  )

  const suivant = useCallback(() => aller(index + 1), [aller, index])
  const precedent = useCallback(() => aller(index - 1), [aller, index])

  const enPause = survol || focus || glissement
  useEffect(() => {
    if (enPause || total <= 1 || !autoPlayMs || refMouvementReduit.current) return
    const minuteur = setInterval(() => aller(index + 1), autoPlayMs)
    return () => clearInterval(minuteur)
  }, [index, enPause, autoPlayMs, total, aller])

  if (total === 0) return null

  function gererClavier(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      suivant()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      precedent()
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label={libelle}
      tabIndex={0}
      onKeyDown={gererClavier}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      className={cn("relative overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50", className)}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onPointerDown={(e) => {
        refDebutGlissement.current = e.clientX
        setGlissement(true)
      }}
      onPointerUp={(e) => {
        if (refDebutGlissement.current === null) return
        const delta = e.clientX - refDebutGlissement.current
        if (delta > 50) precedent()
        else if (delta < -50) suivant()
        refDebutGlissement.current = null
        setGlissement(false)
      }}
      onPointerCancel={() => {
        refDebutGlissement.current = null
        setGlissement(false)
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((item, i) => (
          <div
            key={cleItem(item, i)}
            className="w-full shrink-0"
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${total}`}
            aria-hidden={i !== index}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {showControls && total > 1 && (
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

      {showDots && total > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((item, i) => (
            <button
              key={cleItem(item, i)}
              type="button"
              aria-label={`Aller à l'élément ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => aller(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-background/70 transition-all",
                i === index && "w-4 bg-background"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
