// En-tête homogène des sections de l'accueil, révélé au défilement.
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/features/espace-public/components/Reveal"
import type { DirectionReveal } from "@/hooks/useRevealOnScroll"

interface EnTeteSectionProps {
  idTitre: string
  titre: string
  titreAccent?: string
  surTitre?: string
  sousTitre?: string
  lienTout: string
  libelleTout: string
  direction?: DirectionReveal
}

export function EnTeteSection({
  idTitre,
  titre,
  titreAccent,
  surTitre,
  sousTitre,
  lienTout,
  libelleTout,
  direction = "up",
}: EnTeteSectionProps) {
  return (
    <Reveal className="vt-section-header" direction={direction}>
      <div className="vt-section-header-left vt-accueil-section-copy">
        {surTitre && <span className="vt-section-eyebrow">{surTitre}</span>}
        <h2 id={idTitre}>
          {titre}{titreAccent && <> <span className="vt-title-accent">{titreAccent}</span></>}
        </h2>
      </div>
      <Link to={lienTout} className="vt-btn-circle-arrow">
        {libelleTout}
        <span className="vt-arrow-circle" aria-hidden="true">
          <ArrowRight size={20} aria-hidden="true" />
        </span>
      </Link>
      {sousTitre ? <p className="vt-section-header-description">{sousTitre}</p> : null}
    </Reveal>
  )
}
