// src/features/publications/pages/PublicationsListePage.tsx
import { useState } from "react"
import { Newspaper, ExternalLink } from "lucide-react"

import { DataTable, type Colonne } from "@/components/shared/DataTable"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useDebounce } from "@/hooks/useDebounce"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Publication } from "@/types/api"

const COLONNES: Colonne<Publication>[] = [
  { id: "titre", header: "Titre", cell: (p) => <span className="font-medium text-foreground">{p.titre}</span>, primaire: true },
  { id: "statut", header: "Statut", cell: (p) => <StatusBadge statut={p.statut} /> },
  { id: "date", header: "Date", cell: (p) => <span className="font-data text-muted-foreground">{p.date_publication ? new Date(p.date_publication).toLocaleDateString("fr-FR") : "—"}</span> },
  { id: "photos", header: "Photos", cell: (p) => <span className="font-data text-muted-foreground">{p.photos?.length ?? 0}</span> },
  { id: "action", header: "", cell: (p) => (
    <a href={`/projets-partenariats/publication/${p.id}`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" target="_blank" rel="noopener noreferrer">
      <ExternalLink size={14} />
    </a>
  )},
]

export function PublicationsListePage() {
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data, isLoading } = useQuery({
    queryKey: ["publications", { page, recherche: rechercheDebouncee }],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: Publication[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/publications",
        { params: { page, limit: 25, recherche: rechercheDebouncee || undefined } },
      )
      return reponse.data
    },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Publications</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data ? `${data.meta.total} publication${data.meta.total > 1 ? "s" : ""}` : "Chargement..."}</p>
      </div>

      <TableToolbar valeurRecherche={recherche} onRechercheChange={(v) => { setRecherche(v); setPage(1) }} placeholderRecherche="Rechercher une publication..." />

      <div className="flex justify-end">
        <a href="/presidence/publications/nouveau" className="rounded-[var(--radius-sm)] bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">
          Nouvelle publication
        </a>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Newspaper} titre="Aucune publication" message="Aucune publication n'a ete creee." />
      ) : (
        <DataTable colonnes={COLONNES} donnees={data.data} meta={data.meta} onPageChange={setPage} />
      )}
    </div>
  )
}
