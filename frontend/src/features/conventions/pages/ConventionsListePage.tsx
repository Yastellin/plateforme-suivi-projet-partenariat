// src/features/conventions/pages/ConventionsListePage.tsx

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, FileText } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { FilterChips } from "@/components/shared/FilterChips"
import { TablePagination } from "@/components/shared/TablePagination"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"
import { useConventions } from "@/features/conventions/api/useConventions"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { LIBELLES_STATUT_CONVENTION } from "@/lib/status-mappings"
import { formaterDate } from "@/lib/format"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

type FiltreStatut = 'tous' | 'BROUILLON' | 'EN_COURS' | 'EN_ATTENTE' | 'SIGNEE' | 'EXPIRE' | 'RESILIEE'

const OPTIONS_FILTRE = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'BROUILLON', libelle: 'Brouillons' },
  { cle: 'EN_COURS', libelle: 'En cours' },
  { cle: 'EN_ATTENTE', libelle: 'En attente' },
  { cle: 'SIGNEE', libelle: 'Signées' },
  { cle: 'EXPIRE', libelle: 'Expirées' },
  { cle: 'RESILIEE', libelle: 'Résiliées' },
]

export function ConventionsListePage() {
  const { utilisateur } = useAuth()
  const permissions = usePermissions()
  const [recherche, setRecherche] = useState("")
  const [statutFiltre, setStatutFiltre] = useState<FiltreStatut>("tous")
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const role = utilisateur?.role
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur'

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom: rechercheDebouncee || undefined,
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
            <button
              type="button"
              onClick={() => setDialogueOuvert(true)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle convention
            </button>
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
                <button
                  type="button"
                  onClick={() => setDialogueOuvert(true)}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle convention
                </button>
              ) : undefined
            }
          />
        ) : (
          <PanelBody>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Titre', 'Référence', 'Date de signature', 'Statut'].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]"
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
                          {formaterDate(convention.date_signature ?? "")}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
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

      <Dialog open={dialogueOuvert} onOpenChange={setDialogueOuvert}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle convention</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer une nouvelle convention.
            </DialogDescription>
          </DialogHeader>
          <ConventionForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Convention créée")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
