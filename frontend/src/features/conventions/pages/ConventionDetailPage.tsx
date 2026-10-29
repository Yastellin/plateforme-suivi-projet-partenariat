// src/features/conventions/pages/ConventionDetailPage.tsx

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FileText, Archive, Pencil } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel"
import { LIBELLES_STATUT_CONVENTION } from "@/lib/status-mappings"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"
import { ListeDocumentsEntite } from "@/features/documents/components/ListeDocumentsEntite"
import { useConvention } from "@/features/conventions/api/useConvention"
import { useArchiverConvention } from "@/features/conventions/api/useArchiverConvention"
import { usePermissions } from "@/hooks/usePermissions"
import { formaterDate } from "@/lib/format"
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

export function ConventionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const permissions = usePermissions()
  const navigate = useNavigate()
  const [archivageOuvert, setArchivageOuvert] = useState(false)
  const { data: convention, isLoading } = useConvention(id)
  useTitreBreadcrumb(convention?.titre)
  const archiver = useArchiverConvention()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!convention) {
    return (
      <EmptyState icone={FileText} titre="Convention introuvable" description="Cette convention n'existe pas ou a été supprimée." />
    )
  }

  const info = LIBELLES_STATUT_CONVENTION[convention.statut] ?? LIBELLES_STATUT_CONVENTION.BROUILLON

  return (
    <div>
      <PageHeader
        titre={convention.titre}
        description={convention.reference}
        badge={<StatusBadge libelle={info.libelle} tonalite={info.tonalite} />}
        actions={
          <div className="flex gap-2">
            {permissions.peutModifier ? (
              <button
                type="button"
                onClick={() => navigate(`/presidence/conventions/${convention.id}/modifier`)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </button>
            ) : null}
            {permissions.peutArchiver ? (
              <button
                type="button"
                onClick={() => setArchivageOuvert(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--status-expire-fg)] hover:text-[var(--status-expire-fg)]"
              >
                <Archive className="h-3.5 w-3.5" />
                Archiver
              </button>
            ) : null}
          </div>
        }
      />

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="mt-4">
          <Panel>
            <PanelHeader titre="Informations générales" />
            <PanelBody>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {convention.date_signature && (
                  <div>
                    <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Date de signature</dt>
                    <dd className="mt-1 font-mono text-[12.5px]">{formaterDate(convention.date_signature)}</dd>
                  </div>
                )}
                {convention.date_debut && (
                  <div>
                    <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Date de début</dt>
                    <dd className="mt-1 font-mono text-[12.5px]">{formaterDate(convention.date_debut)}</dd>
                  </div>
                )}
                {convention.date_fin && (
                  <div>
                    <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Date de fin</dt>
                    <dd className="mt-1 font-mono text-[12.5px]">{formaterDate(convention.date_fin)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Référence</dt>
                  <dd className="mt-1 font-mono text-[12.5px]">{convention.reference}</dd>
                </div>
              </dl>
              {convention.description && (
                <div className="mt-4">
                  <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Description</dt>
                  <dd className="mt-1 text-[13.5px]">{convention.description}</dd>
                </div>
              )}
            </PanelBody>
          </Panel>
        </TabsContent>

        <TabsContent value="documents" className="mt-4 flex flex-col gap-4">
          <Panel>
            <PanelHeader titre="Téléverser des documents" sousTitre="Ajoutez plusieurs fichiers liés à cette convention" />
            <PanelBody>
              <DocumentDropzone conventionId={convention.id} />
            </PanelBody>
          </Panel>
          <Panel>
            <PanelHeader titre="Documents associés" />
            <PanelBody>
              <ListeDocumentsEntite conventionId={convention.id} />
            </PanelBody>
          </Panel>
        </TabsContent>
      </Tabs>



      <DestructiveConfirmDialog
        ouvert={archivageOuvert}
        onFermer={() => setArchivageOuvert(false)}
        onConfirmer={() =>
          archiver.mutate(convention.id, {
            onSuccess: () => {
              toast.success("Convention archivée")
              setArchivageOuvert(false)
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
        titre="Archiver cette convention ?"
        description="Cette action est irréversible."
        nomCible={convention.reference}
        libelleAction="Archiver"
      />
    </div>
  )
}
