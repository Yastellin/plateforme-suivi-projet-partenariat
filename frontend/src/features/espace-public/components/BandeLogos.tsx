// src/features/espace-public/components/BandeLogos.tsx
import type { PartenairePublic } from "@/types/api"
import { Link } from "react-router-dom"

export function BandeLogos({ partenaires }: { partenaires: PartenairePublic[] }) {
  const logos = partenaires.filter((partenaire) => partenaire.logo_url)
  if (logos.length === 0) return null

  const largeurEcran = typeof window === "undefined" ? 1440 : window.innerWidth
  const repetitions = Math.max(1, Math.ceil(largeurEcran / (logos.length * 196)))
  const sequence = Array.from({ length: repetitions }, () => logos).flat()
  const elements = (copie: boolean) => sequence.map((partenaire, index) => (
    <span key={`${copie ? "copie-" : ""}${partenaire.id}-${index}`} className="vt-logo-item" title={partenaire.nom}>
      <Link
        to={`/partenaires/${partenaire.id}`}
        aria-label={copie ? undefined : `Voir le partenaire ${partenaire.nom}`}
        tabIndex={copie ? -1 : undefined}
      >
        <img
          src={partenaire.logo_url ?? undefined}
          alt={copie ? "" : `Logo de ${partenaire.nom}`}
          loading="lazy"
          decoding="async"
        />
      </Link>
    </span>
  ))

  return (
    <div className="vt-marq vt-logos" role="region" aria-roledescription="carrousel" aria-label="Logos des partenaires">
      <div className="vt-track">
        {elements(false)}
        <div aria-hidden="true" inert style={{ display: "contents" }}>{elements(true)}</div>
      </div>
    </div>
  )
}
