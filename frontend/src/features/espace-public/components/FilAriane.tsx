// src/features/espace-public/components/FilAriane.tsx
import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

export interface EtapeFil {
  libelle: string
  to?: string
}

// Fil d'Ariane : la derniere etape est la page courante (non cliquable).
export function FilAriane({ etapes }: { etapes: EtapeFil[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="vt-crumb">
      <ol>
        {etapes.map((etape, i) => (
          <Fragment key={`${etape.libelle}-${i}`}>
            <li>
              {etape.to === "/" ? (
                <Link to="/" aria-label={etape.libelle} title={etape.libelle} className="vt-crumb-accueil">
                  <Home size={16} />
                </Link>
              ) : etape.to ? (
                <Link to={etape.to}>{etape.libelle}</Link>
              ) : (
                <span aria-current="page">{etape.libelle}</span>
              )}
            </li>
            {i < etapes.length - 1 && (
              <li aria-hidden="true" className="vt-crumb-sep">
                <ChevronRight size={14} />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
