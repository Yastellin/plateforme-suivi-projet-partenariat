// État vide contextualisé des sections publiques.
import type { ReactNode } from "react"

interface EmptyStateSectionProps {
  icone: ReactNode
  titre: string
  description: string
  actionLibelle?: string
  actionHref?: string
}

export function EmptyStateSection({
  icone,
  titre,
  description,
  actionLibelle,
  actionHref,
}: EmptyStateSectionProps) {
  return (
    <div className="vt-empty-state-card" role="status">
      <div className="vt-empty-icon" aria-hidden="true">{icone}</div>
      <h3 className="vt-empty-titre">{titre}</h3>
      <p className="vt-empty-description">{description}</p>
      {actionLibelle && actionHref ? (
        <a href={actionHref} className="vt-empty-btn">
          {actionLibelle}
        </a>
      ) : null}
    </div>
  )
}
