// src/features/espace-public/components/EnTeteSection.tsx
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/features/espace-public/components/Reveal"
import type { DirectionReveal } from "@/hooks/useRevealOnScroll"

interface EnTeteSectionProps {
  idTitre: string
  titre: string
  sousTitre?: string
  lienVoirTout: string
  libelleVoirTout: string
  direction?: DirectionReveal
}

// En-tête homogène des sections de l'accueil, révélé au défilement.
export function EnTeteSection({
  idTitre,
  titre,
  sousTitre,
  lienVoirTout,
  libelleVoirTout,
  direction = "up",
}: EnTeteSectionProps) {
  return (
    <Reveal className="vt-head vt-accueil-section-head" direction={direction}>
      <div className="vt-accueil-section-copy">
        <h2 id={idTitre}>{titre}</h2>
        {sousTitre ? <p>{sousTitre}</p> : null}
      </div>
      <Link to={lienVoirTout} className="vt-btn vt-btn-ghost">
        {libelleVoirTout}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </Reveal>
  )
}
