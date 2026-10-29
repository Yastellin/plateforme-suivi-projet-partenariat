// Enveloppe commune des pages de liste de la vitrine publique.
import type { ReactNode } from "react"
import { FilAriane } from "@/features/espace-public/components/FilAriane"

export interface EtapePageListe {
  label: string
  href?: string
}

interface PageListePubliqueProps {
  filAriane: EtapePageListe[]
  surTitre: string
  titre: ReactNode
  description: string
  filtres?: ReactNode
  recherche?: ReactNode
  compteurResultats?: string
  children: ReactNode
}

export function PageListePublique({
  filAriane,
  surTitre,
  titre,
  description,
  filtres,
  recherche,
  compteurResultats,
  children,
}: PageListePubliqueProps) {
  return (
    <div className="vt-page-liste-publique">
      <div className="vt-top-section">
        <header className="vt-page-header">
          <div className="vt-breadcrumb">
            <FilAriane etapes={filAriane.map(({ label, href }) => ({ libelle: label, to: href }))} />
          </div>
          <div className="vt-subtitle-wrapper">
            <span className="vt-subtitle">{surTitre}</span>
          </div>
          <h1 className="vt-page-title">{titre}</h1>
          <p className="vt-page-desc">{description}</p>
        </header>
        {(filtres || recherche) && (
          <div className="vt-filter-container">
            {filtres && <div className="vt-list-filters">{filtres}</div>}
            {recherche && <div className="vt-search-wrapper">{recherche}</div>}
          </div>
        )}
      </div>
      <main className="vt-content-area">
        <div className="vt-content-inner">
          {compteurResultats && (
            <p className="vt-results-count" aria-live="polite">{compteurResultats}</p>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
