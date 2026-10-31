// src/features/conventions/pages/ConventionsListePage.tsx

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, FileText, Pencil, Archive } from "lucide-react"
import { toast } from "sonner"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { FilterChips } from "@/components/shared/FilterChips"
import { TablePagination } from "@/components/shared/TablePagination"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { useConventions } from "@/features/conventions/api/useConventions"
import { useArchiverConvention } from "@/features/conventions/api/useArchiverConvention"
import type { Convention } from "@/types/api"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { LIBELLES_STATUT_CONVENTION } from "@/lib/status-mappings"
import { formaterDate } from "@/lib/format"
import { LienDocumentsEntite } from "@/features/documents/components/LienDocumentsEntite"

const LIMITE_PAR_PAGE = 20

type FiltreStatut = 'tous' | 'BROUILLON' | 'EN_ATTENTE_SIGNATURE' | 'SIGNEE' | 'ACTIVE' | 'SUSPENDUE' | 'EXPIREE'

const OPTIONS_FILTRE = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'BROUILLON', libelle: 'Brouillons' },
  { cle: 'EN_ATTENTE_SIGNATURE', libelle: 'En attente' },
  { cle: 'SIGNEE', libelle: 'Signées' },
  { cle: 'ACTIVE', libelle: 'Actives' },
  { cle: 'SUSPENDUE', libelle: 'Suspendues' },
  { cle: 'EXPIREE', libelle: 'Expirées' },
]

export function ConventionsListePage() {
  const { utilisateur } = useAuth()
  const permissions = usePermissions()
  const [recherche, setRecherche] = useState("")
  const [statutFiltre, setStatutFiltre] = useState<FiltreStatut>("tous")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)
  const [aArchiver, setAArchiver] = useState<Convention | null>(null)
  const archiver = useArchiverConvention()

  const role = utilisateur?.role
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur'
  const peutConsulterDocuments = permissions.estPresidence || permissions.estDecideur

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      titre: rechercheDebouncee || undefined,
      statut: statutFiltre !== 'tous' ? statutFiltre : undefined,
    }),
    [page, rechercheDebouncee, statutFiltre]
  )

  const { data, isLoading } = useConventions(filtres)

  return (
    <div>
      <PageHeader
        titre="Conventions"
        description={data ? `${data.meta.total} convention${data.meta.total > 1 ? "s" : ""} enregistrée${data.meta.total > 1 ? "s" : ""}` : "Chargement…"}
        actions={
          permissions.peutCreer ? (
            <Link
              to={`${cheminBase}/conventions/nouveau`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle convention
            </Link>
          ) : null
        }
      />

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur)
            setPage(1)
          }}
          placeholderRecherche="Rechercher une convention…"
          enfants={
            <FilterChips
              options={OPTIONS_FILTRE}
              valeur={statutFiltre}
              onChange={(valeur) => {
                setStatutFiltre(valeur as FiltreStatut)
                setPage(1)
              }}
            />
          }
        />

        {isLoading && !data ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icone={FileText}
            titre={recherche || statutFiltre !== 'tous'
              ? "Aucune convention ne correspond aux filtres"
              : "Aucune convention pour le moment"}
            description={
              recherche || statutFiltre !== 'tous'
                ? "Essayez de modifier la recherche ou de réinitialiser les filtres."
                : "Enregistrez votre première convention pour commencer le suivi."
            }
            action={
              !recherche && statutFiltre === 'tous' && permissions.peutCreer ? (
                <Link
                  to={`${cheminBase}/conventions/nouveau`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle convention
                </Link>
              ) : undefined
            }
          />
        ) : (
          <PanelBody>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Titre', 'Référence', 'Date de signature', 'Statut', 'Actions'].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className={`whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]${entete === 'Actions' ? ' text-right' : ''}`}
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((convention) => {
                    const info = LIBELLES_STATUT_CONVENTION[convention.statut] ?? LIBELLES_STATUT_CONVENTION.BROUILLON

                    return (
                      <tr key={convention.id} className="hover:bg-[var(--color-page-bg)]">
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <Link
                            to={`${cheminBase}/conventions/${convention.id}`}
                            className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                          >
                            {convention.titre}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px] text-[var(--color-text-secondary)]">
                          {convention.reference}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                          {convention.date_signature ? formaterDate(convention.date_signature) : "—"}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            {peutConsulterDocuments ? (
                              <LienDocumentsEntite
                                entite="convention"
                                id={convention.id}
                                nom={convention.titre}
                                cheminBase={cheminBase}
                              />
                            ) : null}
                            {permissions.peutModifier ? (
                              <Link
                                to={`${cheminBase}/conventions/${convention.id}/modifier`}
                                aria-label={`Modifier ${convention.titre}`}
                                title="Modifier"
                                className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            ) : null}
                            {permissions.peutArchiver ? (
                              <button
                                type="button"
                                aria-label={`Archiver ${convention.titre}`}
                                title="Archiver"
                                onClick={() => setAArchiver(convention)}
                                className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--status-expire-fg)]"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {data.meta && <TablePagination meta={data.meta} onChangerPage={setPage} />}
          </PanelBody>
        )}
      </Panel>

      {aArchiver ? (
        <DestructiveConfirmDialog
          ouvert
          onFermer={() => setAArchiver(null)}
          onConfirmer={() =>
            archiver.mutate(aArchiver.id, {
              onSuccess: () => {
                toast.success("Convention archivée")
                setAArchiver(null)
              },
              onError: (erreur: Error) => toast.error(erreur.message),
            })
          }
          titre="Archiver cette convention ?"
          description="La convention sera retirée de la liste active. Cette action est irréversible."
          nomCible={aArchiver.reference}
          libelleAction="Archiver"
          enCours={archiver.isPending}
        />
      ) : null}
    </div>
  )
}
