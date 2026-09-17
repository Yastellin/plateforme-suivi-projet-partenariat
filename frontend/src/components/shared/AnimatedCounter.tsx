// src/components/shared/AnimatedCounter.tsx
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  valeur: number
  label?: string
  prefixe?: string
  suffixe?: string
  dureeMs?: number
  icon?: React.ComponentType<{ size?: number; className?: string }>
  className?: string
}

// Compteur anime declenche a l'entree dans le viewport (utilise par
// <CompteursGlobaux> et <SyntheseCompteurs>, et par la vitrine publique).
export function AnimatedCounter({
  valeur,
  label,
  prefixe = "",
  suffixe = "",
  dureeMs = 1200,
  icon: Icon,
  className,
}: AnimatedCounterProps) {
  const [valeurAffichee, setValeurAffichee] = useState(0)
  const refConteneur = useRef<HTMLDivElement>(null)
  const dejaDeclenche = useRef(false)

  useEffect(() => {
    const element = refConteneur.current
    if (!element) return

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting || dejaDeclenche.current) return
        dejaDeclenche.current = true

        const debut = performance.now()
        const anime = (maintenant: number) => {
          const progression = Math.min((maintenant - debut) / dureeMs, 1)
          const progressionAdoucie = 1 - Math.pow(1 - progression, 3)
          setValeurAffichee(Math.round(progressionAdoucie * valeur))
          if (progression < 1) {
            requestAnimationFrame(anime)
          }
        }
        requestAnimationFrame(anime)
      },
      { threshold: 0.3 }
    )

    observateur.observe(element)
    return () => observateur.disconnect()
  }, [valeur, dureeMs])

  return (
    <div ref={refConteneur} className={cn("flex flex-col items-center gap-1 text-center", className)}>
      {Icon && (
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon size={20} />
        </span>
      )}
      <span className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
        {prefixe}
        {valeurAffichee.toLocaleString("fr-FR")}
        {suffixe}
      </span>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}