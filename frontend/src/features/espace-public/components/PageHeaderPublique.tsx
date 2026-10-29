// En-tête commun et centré des pages de liste publiques.
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface PageHeaderPubliqueProps {
  titre: string
  titreAccent?: string
  description?: string
  icone?: LucideIcon
  etiquette?: string
  surTitre?: string
  children?: ReactNode
}

export function PageHeaderPublique({
  titre,
  titreAccent,
  description,
  icone: Icone,
  etiquette,
  surTitre,
  children,
}: PageHeaderPubliqueProps) {
  const label = surTitre ?? etiquette

  return (
    <section className="vt-page-head vt-page-header">
      <div className="vt-page-head-inner">
        {label && (
          <span className="vt-eyebrow vt-page-eyebrow">
            {Icone && <Icone size={14} aria-hidden="true" />}
            {label}
          </span>
        )}
        <h1>
          {titre}{titreAccent && <> <span className="vt-title-accent">{titreAccent}</span></>}
        </h1>
        {description && <p>{description}</p>}
        {children && <div className="vt-page-head-action">{children}</div>}
      </div>
    </section>
  )
}
