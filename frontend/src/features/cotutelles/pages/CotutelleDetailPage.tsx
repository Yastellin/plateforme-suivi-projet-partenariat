// src/features/cotutelles/pages/CotutelleDetailPage.tsx

import { useState } from "react"
import { useParams } from "react-router-dom"
import { GraduationCap, Archive, Pencil } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CotutelleForm } from "@/features/cotutelles/components/CotutelleForm"
import { useCotutelle } from "@/features/cotutelles/api/useCotutelle"
import { useArchiverCotutelle } from "@/features/cotutelles/api/useArchiverCotutelle"
import { usePermissions } from "@/hooks/usePermissions"
import { formaterDate } from "@/lib/format"

function Champ({ libelle, valeur }: { libelle: string; valeur?: string | null }) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{libelle}</dt>
      <dd className="mt-1 text-[13.5px]">{valeur || "—"}</dd>
    </div>
  )
}

export function CotutelleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const permissions = usePermissions()
  const [modificationOuverte, setModificationOuverte] = useState(false)
  const [archivageOuvert, setArchivageOuvert] = useState(false)
  const { data: cotutelle, isLoading } = useCotutelle(id)
  const archiver = useArchiverCotutelle()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!cotutelle) {
    return (
      <EmptyState icone={GraduationCap} titre="Cotutelle introuvable" description="Cette cotutelle n'existe pas ou a été supprimée." />
    )
  }

  return (
    <div>
      <PageHeader
        titre={cotutelle.nom_doctorant}
        description={`${cotutelle.type === "COTUTELLE" ? "Co-tutelle" : "Co-encadrement"} — ${cotutelle.specialite || "Non précisé"}`}
        actions={
          <div className="flex gap-2">
            {permissions.peutModifier ? (
              <button
                type="button"
                onClick={() => setModificationOuverte(true)}
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

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader titre="Informations générales" />
          <PanelBody>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Champ libelle="Directeur local" valeur={cotutelle.directeur_these_local} />
              <Champ libelle="Directeur partenaire" valeur={cotutelle.directeur_these_partenaire} />
              <Champ libelle="Financement" valeur={cotutelle.financement_bourse} />
              <Champ libelle="Avancement" valeur={cotutelle.etat_avancement} />
              <Champ libelle="Date de début" valeur={formaterDate(cotutelle.date_debut)} />
              {cotutelle.date_prevue_soutenance && (
                <Champ libelle="Soutenance prévue" valeur={formaterDate(cotutelle.date_prevue_soutenance)} />
              )}
            </dl>
          </PanelBody>
        </Panel>

        <div className="flex flex-col gap-4">
          {cotutelle.publications_produites && (
            <Panel>
              <PanelHeader titre="Publications produites" />
              <PanelBody>
                <p className="text-[13.5px]">{cotutelle.publications_produites}</p>
              </PanelBody>
            </Panel>
          )}
          {cotutelle.difficultes_rencontrees && (
            <Panel>
              <PanelHeader titre="Difficultés rencontrées" />
              <PanelBody>
                <p className="text-[13.5px]">{cotutelle.difficultes_rencontrees}</p>
              </PanelBody>
            </Panel>
          )}
          {cotutelle.perspectives && (
            <Panel>
              <PanelHeader titre="Perspectives" />
              <PanelBody>
                <p className="text-[13.5px]">{cotutelle.perspectives}</p>
              </PanelBody>
            </Panel>
          )}
        </div>
      </div>

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la cotutelle</DialogTitle>
          </DialogHeader>
          <CotutelleForm
            cotutelle={cotutelle}
            onSucces={() => {
              setModificationOuverte(false)
              toast.success("Cotutelle mise à jour")
            }}
            onAnnuler={() => setModificationOuverte(false)}
          />
        </DialogContent>
      </Dialog>

      <DestructiveConfirmDialog
        ouvert={archivageOuvert}
        onFermer={() => setArchivageOuvert(false)}
        onConfirmer={() =>
          archiver.mutate(cotutelle.id, {
            onSuccess: () => {
              toast.success("Cotutelle archivée")
              setArchivageOuvert(false)
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
        titre="Archiver cette cotutelle ?"
        description="Cette action est irréversible."
        nomCible={cotutelle.nom_doctorant}
        libelleAction="Archiver"
      />
    </div>
  )
}
