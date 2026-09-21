// src/features/partenariats/pages/PartenariatDetailPage.tsx
import { useParams } from "react-router-dom"
import { useState } from "react"
import { Handshake } from "lucide-react"
import { toast } from "sonner"

import { Archive } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PartenariatForm } from "@/features/partenariats/components/PartenariatForm"
import { BoutonSoumettre } from "@/features/partenariats/components/BoutonSoumettre"
import { usePartenariat } from "@/features/partenariats/api/usePartenariat"
import { useArchiverPartenariat } from "@/features/partenariats/api/useArchiverPartenariat"
import { useAuth } from "@/hooks/useAuth"

export function PartenariatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const [modificationOuverte, setModificationOuverte] = useState(false)
  const [archivageOuvert, setArchivageOuvert] = useState(false)

  const { data: partenariat, isLoading } = usePartenariat(id)
  const archiver = useArchiverPartenariat()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!partenariat) {
    return (
      <div className="p-6">
        <EmptyState icon={Handshake} titre="Partenariat introuvable" message="Ce partenariat n'existe pas ou a ete supprime." />
      </div>
    )
  }

  const estEtablissement = utilisateur?.role === "ETABLISSEMENT"
  const estPresidence = utilisateur?.role === "PRESIDENCE"
  const modifiable = partenariat.statut === "BROUILLON" && estEtablissement

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{partenariat.intitule}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge statut={partenariat.statut} />
            <span className="text-sm text-muted-foreground">{partenariat.domaine}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modifiable && (
            <Button variant="outline" size="sm" onClick={() => setModificationOuverte(true)}>Modifier</Button>
          )}
          {modifiable && <BoutonSoumettre partenariatId={partenariat.id} />}
          {estPresidence && (
            <Button variant="outline" size="sm" onClick={() => setArchivageOuvert(true)}>
              <Archive size={14} className="mr-1" />Archiver
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><span className="text-muted-foreground">Date de debut</span><p className="font-data font-medium">{partenariat.date_debut ? new Date(partenariat.date_debut).toLocaleDateString("fr-FR") : "—"}</p></div>
        <div><span className="text-muted-foreground">Date de fin</span><p className="font-data font-medium">{partenariat.date_fin ? new Date(partenariat.date_fin).toLocaleDateString("fr-FR") : "—"}</p></div>
        <div><span className="text-muted-foreground">Domaine</span><p className="font-medium">{partenariat.domaine}</p></div>
      </div>

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="etablissements">Etablissements ({partenariat.etablissements?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="partenaires">Partenaires ({partenariat.partenaires?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="informations" className="mt-4 space-y-4">
          {partenariat.objet && <div><h3 className="mb-1 font-heading text-sm font-semibold">Objet</h3><p className="text-[13px] text-muted-foreground">{partenariat.objet}</p></div>}
          {partenariat.actions_realisees && <div><h3 className="mb-1 font-heading text-sm font-semibold">Actions realissees</h3><p className="text-[13px] text-muted-foreground">{partenariat.actions_realisees}</p></div>}
          {partenariat.actions_en_cours && <div><h3 className="mb-1 font-heading text-sm font-semibold">Actions en cours</h3><p className="text-[13px] text-muted-foreground">{partenariat.actions_en_cours}</p></div>}
          {partenariat.resultats_obtenus && <div><h3 className="mb-1 font-heading text-sm font-semibold">Resultats obtenus</h3><p className="text-[13px] text-muted-foreground">{partenariat.resultats_obtenus}</p></div>}
          {partenariat.difficultes_contraintes && <div><h3 className="mb-1 font-heading text-sm font-semibold">Difficultes</h3><p className="text-[13px] text-muted-foreground">{partenariat.difficultes_contraintes}</p></div>}
          {partenariat.perspectives_recommandations && <div><h3 className="mb-1 font-heading text-sm font-semibold">Perspectives</h3><p className="text-[13px] text-muted-foreground">{partenariat.perspectives_recommandations}</p></div>}
        </TabsContent>
        <TabsContent value="etablissements" className="mt-4">
          {partenariat.etablissements?.length ? partenariat.etablissements.map((e) => (
            <div key={e.etablissement_id} className="rounded-lg border border-border p-3"><p className="text-sm font-medium">{e.etablissement?.nom ?? e.etablissement_id}</p></div>
          )) : <p className="text-sm text-muted-foreground">Aucun etablissement lie.</p>}
        </TabsContent>
        <TabsContent value="partenaires" className="mt-4">
          {partenariat.partenaires?.length ? partenariat.partenaires.map((p) => (
            <div key={p.partenaire_id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{p.partenaire?.nom ?? p.partenaire_id}</p>
              {p.partenaire?.pays && <p className="text-xs text-muted-foreground">{p.partenaire.pays}</p>}
            </div>
          )) : <p className="text-sm text-muted-foreground">Aucun partenaire lie.</p>}
        </TabsContent>
      </Tabs>

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Modifier le partenariat</DialogTitle></DialogHeader>
          <PartenariatForm partenariat={partenariat} onSucces={() => { setModificationOuverte(false); toast.success("Partenariat mis a jour") }} onAnnuler={() => setModificationOuverte(false)} />
        </DialogContent>
      </Dialog>

      <DestructiveConfirmDialog ouvert={archivageOuvert} onFermer={() => setArchivageOuvert(false)}
        onConfirmer={() => archiver.mutate(partenariat.id, { onSuccess: () => { toast.success("Partenariat archive"); setArchivageOuvert(false) }, onError: (e: Error) => toast.error(e.message) })}
        titre="Archiver ce partenariat ?" description="Cette action est irreversible." texteConfirmation="ARCHIVER" libelleBouton="Archiver" enCours={archiver.isPending} />
    </div>
  )
}