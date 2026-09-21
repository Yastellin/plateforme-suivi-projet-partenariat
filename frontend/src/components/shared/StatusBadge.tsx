// src/components/shared/StatusBadge.tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Table de mapping unique des statuts metier (section 4.1 du prompt) :
// aucune couleur de statut codee en dur ailleurs dans l'application.
const TABLEAU_STATUTS = {
  // Brouillon
  BROUILLON: "brouillon",
  // En attente / en preparation
  EN_ATTENTE: "attente",
  EN_ATTENTE_SIGNATURE: "attente",
  // En cours / active / signee / termine
  EN_COURS: "actif",
  ACTIVE: "actif",
  SIGNEE: "actif",
  ACTIF: "actif",
  TERMINE: "actif",
  // Expiree / en retard / suspendu
  EXPIRE: "expire",
  EXPIREE: "expire",
  SUSPENDU: "expire",
  SUSPENDUE: "expire",
  EN_RETARD: "expire",
  // Archive
  ARCHIVE: "archive",
} as const

export type StatutMetier = keyof typeof TABLEAU_STATUTS

type NiveauStatut = "brouillon" | "attente" | "actif" | "expire" | "archive"

const LIBELLES: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_ATTENTE: "En attente",
  EN_ATTENTE_SIGNATURE: "En attente de signature",
  EN_COURS: "En cours",
  ACTIVE: "Active",
  SIGNEE: "Signee",
  ACTIF: "Actif",
  TERMINE: "Termine",
  EXPIRE: "Expire",
  EXPIREE: "Expiree",
  SUSPENDU: "Suspendu",
  SUSPENDUE: "Suspendue",
  ARCHIVE: "Archive",
}

const CLASSES_NIVEAU: Record<NiveauStatut, string> = {
  brouillon: "bg-statut-brouillon-bg text-statut-brouillon-fg border-transparent",
  attente: "bg-statut-attente-bg text-statut-attente-fg border-transparent",
  actif: "bg-statut-actif-bg text-statut-actif-fg border-transparent",
  expire: "bg-statut-expire-bg text-statut-expire-fg border-transparent",
  archive: "bg-statut-archive-bg text-statut-archive-fg border-transparent",
}

interface StatusBadgeProps {
  statut: string
  className?: string
}

export function StatusBadge({ statut, className }: StatusBadgeProps) {
  const niveau = TABLEAU_STATUTS[statut as StatutMetier] ?? "actif"

  return (
    <Badge className={cn(CLASSES_NIVEAU[niveau], className)}>
      {LIBELLES[statut] ?? statut}
    </Badge>
  )
}
