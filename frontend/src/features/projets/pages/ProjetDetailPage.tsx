// src/features/projets/pages/ProjetDetailPage.tsx
import { useParams } from "react-router-dom"
import { useState } from "react"
import { FolderKanban, Archive } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ProjetOngletsFiche } from "@/features/projets/components/ProjetOngletsFiche"
import { IndicateurAvancement } from "@/features/projets/components/IndicateurAvancement"
import { BoutonSoumettre } from "@/features/projets/components/BoutonSoumettre"
import { useProjet } from "@/features/projets/api/useProjet"
import { useArchiverProjet } from "@/features/projets/api/useArchiverProjet"
import { useAuth } from "@/hooks/useAuth"

export function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const [archivageOuvert, setArchivageOuvert] = useState(false)
  const { data: projet, isLoading } = useProjet(id)
  const archiver = useArchiverProjet()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!projet) {
    return (
      <div className="p-6">
        <EmptyState icon={FolderKanban} titre="Projet introuvable" message="Ce projet n'existe pas ou a ete supprime." />
      </div>
    )
  }

  const estEtablissement = utilisateur?.role === "ETABLISSEMENT"
  const estPresidence = utilisateur?.role === "PRESIDENCE"
  const modifiable = projet.statut === "BROUILLON" && estEtablissement

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{projet.nom}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge statut={projet.statut} />
            <span className="text-sm text-muted-foreground">{projet.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modifiable && <BoutonSoumettre projetId={projet.id} />}
          {estPresidence && (
            <Button variant="outline" size="sm" onClick={() => setArchivageOuvert(true)}>
              <Archive size={14} className="mr-1" />Archiver
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><span className="text-muted-foreground">Date de debut</span><p className="font-data font-medium">{new Date(projet.date_debut).toLocaleDateString("fr-FR")}</p></div>
        <div><span className="text-muted-foreground">Date de fin prevue</span><p className="font-data font-medium">{new Date(projet.date_fin_prevue).toLocaleDateString("fr-FR")}</p></div>
        {projet.budget != null && <div><span className="text-muted-foreground">Budget</span><p className="font-data font-medium">{projet.budget.toLocaleString("fr-MG")} MGA</p></div>}
      </div>

      <div className="max-w-sm"><IndicateurAvancement projetId={projet.id} /></div>

      <ProjetOngletsFiche projet={projet} onModifie={() => {}} />

      <DestructiveConfirmDialog ouvert={archivageOuvert} onFermer={() => setArchivageOuvert(false)}
        onConfirmer={() => archiver.mutate(projet.id, { onSuccess: () => { toast.success("Projet archive"); setArchivageOuvert(false) }, onError: (e: Error) => toast.error(e.message) })}
        titre="Archiver ce projet ?" description="Cette action est irreversible." texteConfirmation="ARCHIVER" libelleBouton="Archiver" enCours={archiver.isPending} />
    </div>
  )
}