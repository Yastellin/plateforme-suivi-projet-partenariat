import type { ReactNode } from "react"

interface DetailLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  className?: string
  labelSidebar?: string
}

// Mise en page commune des détails publics, avec une sidebar sémantique.
export function DetailLayout({
  children,
  sidebar,
  className = "",
  labelSidebar = "Informations complémentaires",
}: DetailLayoutProps) {
  return (
    <div className={`vt-detail-layout vt-detail-conteneur ${className}`}>
      <div className="vt-detail-main">{children}</div>
      <aside className="vt-detail-sidebar" aria-label={labelSidebar}>
        {sidebar}
      </aside>
    </div>
  )
}
