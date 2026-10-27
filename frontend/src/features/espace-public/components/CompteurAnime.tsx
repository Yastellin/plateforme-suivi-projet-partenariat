// src/features/espace-public/components/CompteurAnime.tsx
import { useEffect, useRef, useState } from "react"

export function CompteurAnime({ valeur }: { valeur: number }) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const [affiche, setAffiche] = useState(valeur)

  useEffect(() => {
    const element = elementRef.current
    const reduction = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!element || reduction || !("IntersectionObserver" in window)) return

    let frame = 0
    const observateur = new IntersectionObserver(([entree]) => {
      if (!entree.isIntersecting) return
      observateur.disconnect()
      setAffiche(0)
      const debut = performance.now()
      const animer = (maintenant: number) => {
        const progression = Math.min((maintenant - debut) / 900, 1)
        setAffiche(Math.round(valeur * (1 - (1 - progression) ** 3)))
        if (progression < 1) frame = requestAnimationFrame(animer)
      }
      frame = requestAnimationFrame(animer)
    }, { threshold: 0.6 })

    observateur.observe(element)
    return () => {
      observateur.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [valeur])

  return <span ref={elementRef}>{affiche.toLocaleString("fr-FR")}</span>
}
