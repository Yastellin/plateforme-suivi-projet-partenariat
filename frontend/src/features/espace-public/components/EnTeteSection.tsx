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
  direction?: DirectionReveal
}

interface BoutonVoirToutProps {
  lien: string
  libelle: string
  direction?: DirectionReveal
}

export function EnTeteSection({
  idTitre,
  titre,
  titreAccent,
  surTitre,
  sousTitre,
  direction = "up",
}: EnTeteSectionProps) {
  return (
    <Reveal className="vt-head vt-accueil-section-head" direction={direction}>
      <div className="vt-accueil-section-copy">
        {surTitre && <span className="vt-section-eyebrow">{surTitre}</span>}
        <h2 id={idTitre}>
          {titre}{titreAccent && <> <span className="vt-title-accent">{titreAccent}</span></>}
        </h2>
        {sousTitre ? <p>{sousTitre}</p> : null}
      </div>
    </Reveal>
  )
}

// CTA partagé placé sous la grille ou le bandeau de partenaires.
export function BoutonVoirTout({
  lien,
  libelle,
  direction = "up",
}: BoutonVoirToutProps) {
  return (
    <Reveal className="vt-accueil-section-action" direction={direction}>
      <Link to={lien} className="vt-btn vt-btn-ghost vt-btn-voir-tout">
        {libelle}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </Reveal>
  )
}
