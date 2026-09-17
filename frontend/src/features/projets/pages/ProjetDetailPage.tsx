// src/features/projets/pages/ProjetDetailPage.tsx
import { useParams } from "react-router-dom"
import { FolderKanban } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ProjetOngletsFiche } from "@/features/projets/components/ProjetOngletsFiche"
import { IndicateurAvancement } from "@/features/projets/components/IndicateurAvancement"
import { BoutonSoumettre } from "@/features/projets/components/BoutonSoumettre"
import { useProjet } from "@/features/projets/api/useProjet"
import { useAuth } from "@/hooks/useAuth"

export function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const { data: projet, isLoading } = useProjet(id)

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>
  }

  if (!projet) {
    return (
      <div className="p-6">
        <EmptyState icon={FolderKanban} titre="Projet introuvable" message="Ce projet n'existe pas ou a ete supprime." />
      </div>
    )
  }

  const modifiable = projet.statut === "BROUILLON" && utilisateur?.role === "ETABLISSEMENT"

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{projet.nom}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge statut={projet.statut} />
            <span className="text-sm text-muted-foreground">{projet.type}</span>
          </div>
        </div>
        {modifiable && <BoutonSoumettre projetId={projet.id} />}
      </div>

      <div className="mb-6 max-w-sm">
        <IndicateurAvancement projetId={projet.id} />
      </div>

      <ProjetOngletsFiche projet={projet} onModifie={() => {}} />
    </div>
  )
}