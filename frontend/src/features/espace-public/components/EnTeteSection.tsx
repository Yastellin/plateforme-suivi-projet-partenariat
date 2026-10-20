// src/features/espace-public/components/EnTeteSection.tsx
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/features/espace-public/components/Reveal"

interface EnTeteSectionProps {
  etiquette: string
  titre: string
  description?: string
  lien?: { to: string; libelle: string }
  children?: ReactNode
}

// En-tete commun des sections de l'accueil (style maquette) : etiquette,
// titre, description courte et lien vers la page complete. Apparait au scroll.
export function EnTeteSection({ etiquette, titre, description, lien }: EnTeteSectionProps) {
  return (
    <Reveal className="vt-head">
      <div style={{ maxWidth: 680 }}>
        <span className="vt-eyebrow">{etiquette}</span>
        <h2 style={{ marginTop: 8 }}>{titre}</h2>
        {description && <p style={{ marginTop: 8 }}>{description}</p>}
      </div>
      {lien && (
        <Link to={lien.to} className="vt-btn vt-btn-ghost">
          {lien.libelle}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </Reveal>
  )
}
