// src/features/cotutelles/pages/CotutelleDetailPage.tsx
import { useState } from "react"
import { useParams } from "react-router-dom"
import { GraduationCap, Archive } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CotutelleForm } from "@/features/cotutelles/components/CotutelleForm"
import { useCotutelle } from "@/features/cotutelles/api/useCotutelle"
import { useArchiverCotutelle } from "@/features/cotutelles/api/useArchiverCotutelle"
import { useAuth } from "@/hooks/useAuth"

export function CotutelleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const [modificationOuverte, setModificationOuverte] = useState(false)
  const [archivageOuvert, setArchivageOuvert] = useState(false)
  const { data: cotutelle, isLoading } = useCotutelle(id)
  const archiver = useArchiverCotutelle()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!cotutelle) {
    return (
      <div className="p-6">
        <EmptyState icon={GraduationCap} titre="Cotutelle introuvable" message="Cette cotutelle n'existe pas ou a ete supprimee." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{cotutelle.nom_doctorant}</h1>
          <p className="text-sm text-muted-foreground">{cotutelle.type === "COTUTELLE" ? "Co-tutelle" : "Co-encadrement"} — {cotutelle.specialite}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setModificationOuverte(true)}>Modifier</Button>
          {utilisateur?.role === "PRESIDENCE" && (
            <Button variant="outline" size="sm" onClick={() => setArchivageOuvert(true)}>
              <Archive size={14} className="mr-1" />Archiver
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div><span className="text-muted-foreground">Directeur local</span><p className="font-medium">{cotutelle.directeur_these_local || "—"}</p></div>
        <div><span className="text-muted-foreground">Directeur partenaire</span><p className="font-medium">{cotutelle.directeur_these_partenaire || "—"}</p></div>
        <div><span className="text-muted-foreground">Financement</span><p className="font-medium">{cotutelle.financement_bourse || "—"}</p></div>
        <div><span className="text-muted-foreground">Avancement</span><p className="font-medium">{cotutelle.etat_avancement || "—"}</p></div>
        <div><span className="text-muted-foreground">Date de debut</span><p className="font-data font-medium">{new Date(cotutelle.date_debut).toLocaleDateString("fr-FR")}</p></div>
        {cotutelle.date_prevue_soutenance && <div><span className="text-muted-foreground">Soutenance prevue</span><p className="font-data font-medium">{new Date(cotutelle.date_prevue_soutenance).toLocaleDateString("fr-FR")}</p></div>}
      </div>

      {cotutelle.publications_produites && (
        <div><h3 className="mb-1 font-heading text-sm font-semibold">Publications produites</h3><p className="text-[13px] text-muted-foreground">{cotutelle.publications_produites}</p></div>
      )}
      {cotutelle.difficultes_rencontrees && (
        <div><h3 className="mb-1 font-heading text-sm font-semibold">Difficultes rencontrees</h3><p className="text-[13px] text-muted-foreground">{cotutelle.difficultes_rencontrees}</p></div>
      )}
      {cotutelle.perspectives && (
        <div><h3 className="mb-1 font-heading text-sm font-semibold">Perspectives</h3><p className="text-[13px] text-muted-foreground">{cotutelle.perspectives}</p></div>
      )}

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Modifier la cotutelle</DialogTitle></DialogHeader>
          <CotutelleForm cotutelle={cotutelle} onSucces={() => { setModificationOuverte(false); toast.success("Cotutelle mise a jour") }} onAnnuler={() => setModificationOuverte(false)} />
        </DialogContent>
      </Dialog>

      <DestructiveConfirmDialog ouvert={archivageOuvert} onFermer={() => setArchivageOuvert(false)}
        onConfirmer={() => archiver.mutate(cotutelle.id, { onSuccess: () => { toast.success("Cotutelle archivee"); setArchivageOuvert(false) }, onError: (e: Error) => toast.error(e.message) })}
        titre="Archiver cette cotutelle ?" description="Cette action est irreversible." texteConfirmation="ARCHIVER" libelleBouton="Archiver" />
    </div>
  )
}