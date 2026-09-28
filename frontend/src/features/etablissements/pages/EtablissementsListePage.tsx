// src/features/etablissements/pages/EtablissementsListePage.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react"

import { DataTable, type Colonne } from "@/components/shared/DataTable"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { useEtablissements } from "@/features/etablissements/api/useEtablissements"
import { useDebounce } from "@/hooks/useDebounce"
import type { Etablissement } from "@/types/api"

const COLONNES: Colonne<Etablissement>[] = [
  {
    id: "nom",
    header: "Nom",
    cell: (e) => <span className="font-medium text-foreground">{e.nom}</span>,
    primaire: true,
  },
  {
    id: "sigle",
    header: "Sigle",
    cell: (e) => <span className="font-data text-muted-foreground">{e.sigle ?? "—"}</span>,
  },
  {
    id: "description",
    header: "Description",
    cell: (e) => <span className="text-muted-foreground line-clamp-1">{e.description ?? "—"}</span>,
  },
]

export function EtablissementsListePage() {
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data, isLoading } = useEtablissements({
    page,
    limit: 25,
    recherche: rechercheDebouncee || undefined,
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Établissements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `${data.meta.total} établissement${data.meta.total > 1 ? "s" : ""}` : "Chargement..."}
        </p>
      </div>

      <TableToolbar
        valeurRecherche={recherche}
        onRechercheChange={(v) => { setRecherche(v); setPage(1) }}
        placeholderRecherche="Rechercher un établissement..."
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Building2} titre="Aucun établissement" message="Aucun établissement n'est enregistré." />
      ) : (
        <DataTable
          colonnes={COLONNES}
          donnees={data.data}
          meta={data.meta}
          onPageChange={setPage}
          onLigneClick={(e) => navigate(`/presidence/etablissements/${e.id}`)}
        />
      )}
    </div>
  )
}
