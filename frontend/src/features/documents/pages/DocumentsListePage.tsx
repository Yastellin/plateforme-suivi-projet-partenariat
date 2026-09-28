// src/features/documents/pages/DocumentsListePage.tsx
import { useState } from "react"
import { FileText, Download, ExternalLink } from "lucide-react"

import { DataTable, type Colonne } from "@/components/shared/DataTable"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/useDebounce"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { DocumentFichier } from "@/types/api"

const COLONNES: Colonne<DocumentFichier>[] = [
  { id: "nom", header: "Nom", cell: (d) => <span className="font-medium text-foreground">{d.nom_fichier}</span>, primaire: true },
  { id: "type", header: "Type", cell: (d) => <Badge variant="outline">{d.type}</Badge> },
  { id: "version", header: "Version", cell: (d) => <span className="font-data text-muted-foreground">v{d.version}</span> },
  { id: "date", header: "Date", cell: (d) => <span className="font-data text-muted-foreground">{new Date(d.created_at).toLocaleDateString("fr-FR")}</span> },
  {  id: "action", header: "Actions", cell: (d) => (
    <div className="flex items-center gap-1">
      <a href={`/presidence/documents/${d.id}`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
        <ExternalLink size={14} />
      </a>
      <a href={`/api/documents/${d.id}/telecharger`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" download>
        <Download size={14} />
      </a>
    </div>
  )},
]

export function DocumentsListePage() {
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data, isLoading } = useQuery({
    queryKey: ["documents", { page, recherche: rechercheDebouncee }],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: DocumentFichier[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/documents",
        { params: { page, limit: 25, recherche: rechercheDebouncee || undefined } },
      )
      return reponse.data
    },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data ? `${data.meta.total} document${data.meta.total > 1 ? "s" : ""}` : "Chargement..."}</p>
      </div>

      <TableToolbar valeurRecherche={recherche} onRechercheChange={(v) => { setRecherche(v); setPage(1) }} placeholderRecherche="Rechercher un document..." />

      <div className="flex justify-end">
        <a href="/presidence/documents/nouveau" className="rounded-[var(--radius-sm)] bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">
          Televerser un document
        </a>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={FileText} titre="Aucun document" message="Aucun document n'a ete televerse." />
      ) : (
        <DataTable colonnes={COLONNES} donnees={data.data} meta={data.meta} onPageChange={setPage} />
      )}
    </div>
  )
}
