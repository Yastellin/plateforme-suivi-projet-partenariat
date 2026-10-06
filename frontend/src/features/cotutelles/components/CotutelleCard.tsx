// src/features/cotutelles/components/CotutelleCard.tsx
import { Link } from "react-router-dom"
import { GraduationCap } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { obtenirInfoStatut } from "@/lib/status-mappings"
import type { CotutelleThese } from "@/types/api"

export function CotutelleCard({ cotutelle }: { cotutelle: CotutelleThese }) {
  return (
    <Link
      to={`/presidence/cotutelles/${cotutelle.id}`}
      className="flex flex-col gap-2 rounded-md border border-border p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-muted-foreground" />
          <span className="font-medium">{cotutelle.nom_doctorant}</span>
        </div>
        {cotutelle.etat_avancement && <StatusBadge libelle={obtenirInfoStatut(cotutelle.etat_avancement).libelle} tonalite={obtenirInfoStatut(cotutelle.etat_avancement).tonalite} />}
      </div>
      {cotutelle.specialite && (
        <p className="text-sm text-muted-foreground">{cotutelle.specialite}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {cotutelle.type === "COTUTELLE" ? "Co-tutelle" : "Co-encadrement"}
      </p>
    </Link>
  )
}// src/features/cotutelles/components/CotutelleCard.tsx
