// src/features/conventions/pages/ConventionDetailPage.tsx
import { useState } from "react"
import { useParams } from "react-router-dom"
import { FileText, Archive } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"
import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"
import { DocumentVersionsListe } from "@/features/documents/components/DocumentVersionsListe"
import { useConvention } from "@/features/conventions/api/useConvention"
import { useArchiverConvention } from "@/features/conventions/api/useArchiverConvention"
import { useAuth } from "@/hooks/useAuth"

export function ConventionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const [modificationOuverte, setModificationOuverte] = useState(false)
  const [archivageOuvert, setArchivageOuvert] = useState(false)
  const { data: convention, isLoading } = useConvention(id)
  const archiver = useArchiverConvention()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!convention) {
    return (
      <div className="p-6">
        <EmptyState icon={FileText} titre="Convention introuvable" message="Cette convention n'existe pas ou a ete supprimee." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{convention.titre}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{convention.reference}</span>
            <StatusBadge statut={convention.statut} />
          </div>
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

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            {convention.date_signature && <div><span className="text-muted-foreground">Date de signature</span><p className="font-data font-medium">{new Date(convention.date_signature).toLocaleDateString("fr-FR")}</p></div>}
            {convention.date_debut && <div><span className="text-muted-foreground">Date de debut</span><p className="font-data font-medium">{new Date(convention.date_debut).toLocaleDateString("fr-FR")}</p></div>}
            {convention.date_fin && <div><span className="text-muted-foreground">Date de fin</span><p className="font-data font-medium">{new Date(convention.date_fin).toLocaleDateString("fr-FR")}</p></div>}
          </div>
          {convention.description && (
            <div><h3 className="mb-1 font-heading text-sm font-semibold">Description</h3><p className="text-[13px] text-muted-foreground">{convention.description}</p></div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4 flex flex-col gap-4">
          <DocumentDropzone conventionId={convention.id} />
          <div>
            <h3 className="mb-2 font-heading text-sm font-semibold">Documents associes</h3>
            <DocumentVersionsListe documentId={convention.id} />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Modifier la convention</DialogTitle></DialogHeader>
          <ConventionForm convention={convention} onSucces={() => { setModificationOuverte(false); toast.success("Convention mise a jour") }} onAnnuler={() => setModificationOuverte(false)} />
        </DialogContent>
      </Dialog>

      <DestructiveConfirmDialog ouvert={archivageOuvert} onFermer={() => setArchivageOuvert(false)}
        onConfirmer={() => archiver.mutate(convention.id, { onSuccess: () => { toast.success("Convention archivee"); setArchivageOuvert(false) }, onError: (e: Error) => toast.error(e.message) })}
        titre="Archiver cette convention ?" description="Cette action est irreversible." texteConfirmation="ARCHIVER" libelleBouton="Archiver" />
    </div>
  )
}