// src/features/espace-public/components/PageHeaderPublique.tsx
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface PageHeaderPubliqueProps {
  titre: string
  description?: string
  icone?: LucideIcon
  etiquette?: string
  children?: ReactNode
}

// En-tete commun des pages de la vitrine publique (style maquette) : fond blanc,
// filet bas, etiquette, titre et description. La zone d'action (recherche, par
// exemple) s'affiche sous la description.
export function PageHeaderPublique({
  titre,
  description,
  icone: Icone,
  etiquette,
  children,
}: PageHeaderPubliqueProps) {
  return (
    <section className="vt-page-head">
      <div className="vt-page-head-inner">
        {etiquette && (
          <span className="vt-eyebrow">
            {Icone && <Icone size={14} aria-hidden="true" />}
            {etiquette}
          </span>
        )}
        <h1>{titre}</h1>
        {description && <p>{description}</p>}
        {children && <div className="mt-8 max-w-md">{children}</div>}
      </div>
    </section>
  )
}
