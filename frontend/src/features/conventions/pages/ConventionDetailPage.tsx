// src/features/conventions/pages/ConventionDetailPage.tsx

import { useState, type ReactNode } from "react"
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
import { LogoEtablissement } from "@/components/shared/LogoEtablissement"
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

interface ChampDetail {
  libelle: string
  valeur: ReactNode
  sousValeur?: string | null
  mono?: boolean
}

// Grille libellé / valeur ; une valeur vide s'affiche « — ».
function DetailChamps({ elements }: { elements: ChampDetail[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
      {elements.map((champ) => (
        <div key={champ.libelle} className="min-w-0">
          <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{champ.libelle}</dt>
          <dd className={`mt-1 break-words text-[13.5px] text-[var(--color-text-primary)] ${champ.mono ? "font-mono text-[12.5px]" : ""}`}>
            {champ.valeur ?? "—"}
            {champ.sousValeur ? <span className="block text-[12.5px] text-[var(--color-text-secondary)]">{champ.sousValeur}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

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

        <TabsContent value="informations" className="mt-4 flex flex-col gap-4">
          <Panel>
            <PanelHeader titre="Informations générales" />
            <PanelBody>
              <DetailChamps
                elements={[
                  { libelle: "Référence", valeur: convention.reference, mono: true },
                  { libelle: "Statut", valeur: <StatusBadge libelle={info.libelle} tonalite={info.tonalite} /> },
                  {
                    libelle: "Établissement",
                    valeur: convention.etablissement_nom ? (
                      <span className="inline-flex items-center gap-2">
                        <LogoEtablissement logoUrl={convention.etablissement_logo_url} nom={convention.etablissement_nom} className="h-6 w-6" />
                        {convention.etablissement_nom}
                      </span>
                    ) : null,
                  },
                  { libelle: "Dernière étape", valeur: convention.date_derniere_etape ? formaterDate(convention.date_derniere_etape) : null, mono: true },
                ]}
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader titre="Dates" />
            <PanelBody>
              <DetailChamps
                elements={[
                  { libelle: "Date de signature", valeur: convention.date_signature ? formaterDate(convention.date_signature) : null, mono: true },
                  { libelle: "Date de début", valeur: convention.date_debut ? formaterDate(convention.date_debut) : null, mono: true },
                  { libelle: "Date de fin", valeur: convention.date_fin ? formaterDate(convention.date_fin) : null, mono: true },
                ]}
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader titre="Liens" sousTitre="Partenariat, projet et cotutelle rattachés à cette convention" />
            <PanelBody>
              <DetailChamps
                elements={[
                  { libelle: "Partenariat", valeur: convention.partenariat ? convention.partenariat.libelle : null, sousValeur: convention.partenariat?.complement },
                  { libelle: "Projet", valeur: convention.projet ? convention.projet.libelle : null, sousValeur: convention.projet?.complement },
                  { libelle: "Cotutelle", valeur: convention.cotutelle ? convention.cotutelle.libelle : null, sousValeur: convention.cotutelle?.complement },
                ]}
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader titre="Description" />
            <PanelBody>
              <p className="whitespace-pre-wrap text-[13.5px] leading-6 text-[var(--color-text-primary)]">
                {convention.description?.trim() ? convention.description : "Aucune description renseignée."}
              </p>
            </PanelBody>
          </Panel>

          {permissions.estPresidence || permissions.estDecideur ? (
            <Panel>
              <PanelHeader titre="Documents associés" sousTitre="Fichiers liés à cette convention, téléchargeables depuis cette fiche" />
              <PanelBody>
                <ListeDocumentsEntite conventionId={convention.id} />
              </PanelBody>
            </Panel>
          ) : null}
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
