import type { ReactNode } from "react"

export type VarianteBadgeCategorie =
  | "recherche"
  | "formation"
  | "innovation"
  | "en-cours"
  | "termine"
  | "avenir"
  | "neutre"

interface BadgeCategorieProps {
  children: ReactNode
  variante?: VarianteBadgeCategorie
}

// Badge partagé pour les domaines de coopération et les statuts de projet.
export function BadgeCategorie({ children, variante = "neutre" }: BadgeCategorieProps) {
  return <span className={`vt-badge-categorie vt-badge-${variante}`}>{children}</span>
}
