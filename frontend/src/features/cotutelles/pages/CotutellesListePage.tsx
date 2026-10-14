// src/features/cotutelles/pages/CotutellesListePage.tsx

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, GraduationCap } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { TablePagination } from "@/components/shared/TablePagination"
import { Skeleton } from "@/components/ui/skeleton"
import { CotutelleForm } from "@/features/cotutelles/components/CotutelleForm"
import { useCotutelles } from "@/features/cotutelles/api/useCotutelles"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { formaterDate } from "@/lib/format"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

export function CotutellesListePage() {
  const { utilisateur } = useAuth()
  const permissions = usePermissions()
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const role = utilisateur?.role
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur'

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom_doctorant: rechercheDebouncee || undefined,
    }),
    [page, rechercheDebouncee]
  )

  const { data, isLoading } = useCotutelles(filtres)

  return (
    <div>
      <PageHeader
        titre="Cotutelles"
        description={data ? `${data.meta.total} cotutelle${data.meta.total > 1 ? "s" : ""} enregistrée${data.meta.total > 1 ? "s" : ""}` : "Chargement…"}
        actions={
          permissions.peutCreer ? (
            <button
              type="button"
              onClick={() => setDialogueOuvert(true)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle cotutelle
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
          placeholderRecherche="Rechercher une cotutelle…"
        />

        {isLoading && !data ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icone={GraduationCap}
            titre={recherche ? "Aucune cotutelle ne correspond à la recherche" : "Aucune cotutelle pour le moment"}
            description={
              recherche
                ? "Essayez de modifier la recherche."
                : "Enregistrez votre première cotutelle pour commencer le suivi."
            }
            action={
              !recherche && permissions.peutCreer ? (
                <button
                  type="button"
                  onClick={() => setDialogueOuvert(true)}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle cotutelle
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
                    {['Doctorant', 'Spécialité', 'Type', 'Date de début'].map((entete) => (
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
                  {data.data.map((cotutelle) => (
                    <tr key={cotutelle.id} className="hover:bg-[var(--color-page-bg)]">
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                        <Link
                          to={`${cheminBase}/cotutelles/${cotutelle.id}`}
                          className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                        >
                          {cotutelle.nom_doctorant}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {cotutelle.specialite || "—"}
                      </td>
                      <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {cotutelle.type === "COTUTELLE" ? "Co-tutelle" : "Co-encadrement"}
                      </td>
                      <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                        {formaterDate(cotutelle.date_debut)}
                      </td>
                    </tr>
                  ))}
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
            <DialogTitle>Nouvelle cotutelle</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer une nouvelle cotutelle.
            </DialogDescription>
          </DialogHeader>
          <CotutelleForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Cotutelle créée")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
