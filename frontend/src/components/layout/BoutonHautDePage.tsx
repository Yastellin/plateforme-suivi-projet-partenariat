// src/components/layout/BoutonHautDePage.tsx
// Bouton rond flottant de la vitrine publique : apparait apres un defilement
// et ramene en haut de page. Le defilement est instantane si l'utilisateur
// demande de reduire les animations.
import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

const SEUIL_AFFICHAGE = 600

export function BoutonHautDePage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const surDefilement = () => setVisible(window.scrollY > SEUIL_AFFICHAGE)
    surDefilement()
    window.addEventListener("scroll", surDefilement, { passive: true })
    return () => window.removeEventListener("scroll", surDefilement)
  }, [])

  const remonter = () => {
    const reduire = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduire ? "auto" : "smooth" })
  }

  return (
    <button
      type="button"
      className="vt-totop"
      data-visible={visible}
      onClick={remonter}
      aria-label="Revenir en haut de la page"
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  )
}
