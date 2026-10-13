// src/features/publications/pages/PublicationsListePage.tsx

import { useState } from "react"
import { Newspaper, ExternalLink } from "lucide-react"

import { DataTable, type Colonne } from "@/components/shared/DataTable"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { obtenirInfoStatut } from "@/lib/status-mappings"
import { useDebounce } from "@/hooks/useDebounce"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formaterDate } from "@/lib/format"
import type { Publication } from "@/types/api"

const COLONNES: Colonne<Publication>[] = [
  {
    id: "titre",
    header: "Titre",
    cell: (p) => <span className="font-medium text-[var(--color-text-primary)]">{p.titre}</span>,
    primaire: true,
  },
  {
    id: "statut",
    header: "Statut",
    cell: (p) => <StatusBadge libelle={obtenirInfoStatut(p.statut).libelle} tonalite={obtenirInfoStatut(p.statut).tonalite} />,
  },
  {
    id: "date",
    header: "Date",
    cell: (p) => <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">{formaterDate(p.date_publication ?? "")}</span>,
  },
  {
    id: "photos",
    header: "Photos",
    cell: (p) => <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">{p.photos?.length ?? 0}</span>,
  },
  {
    id: "action",
    header: "",
    cell: (p) => (
      <a
        href={`/projets-partenariats/publication/${p.id}`}
        className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Voir la publication"
      >
        <ExternalLink size={14} />
      </a>
    ),
  },
]

export function PublicationsListePage() {
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data, isLoading } = useQuery({
    queryKey: ["publications", { page, recherche: rechercheDebouncee }],
    queryFn: async () => {
      const reponse = await apiClient.get<{
        data: Publication[]
        meta: { page: number; limit: number; total: number; totalPages: number }
      }>(
        "/publications",
        { params: { page, limit: 25, titre: rechercheDebouncee || undefined } },
      )
      return reponse.data
    },
  })

  return (
    <div>
      <PageHeader
        titre="Publications"
        description={data ? `${data.meta.total} publication${data.meta.total > 1 ? "s" : ""} enregistrée${data.meta.total > 1 ? "s" : ""}` : "Chargement…"}
      />

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur)
            setPage(1)
          }}
          placeholderRecherche="Rechercher une publication…"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <div key={cle} className="h-12 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icone={Newspaper}
            titre={recherche ? "Aucun résultat pour cette recherche" : "Aucune publication"}
            description={recherche ? "Essayez avec un autre terme de recherche." : "Aucune publication n'a été créée."}
          />
        ) : (
          <PanelBody>
            <DataTable colonnes={COLONNES} donnees={data.data} meta={data.meta} onPageChange={setPage} />
          </PanelBody>
        )}
      </Panel>
    </div>
  )
}
