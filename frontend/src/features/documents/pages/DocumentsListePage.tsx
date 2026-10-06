// src/features/documents/pages/DocumentsListePage.tsx

import { useState } from "react"
import { Link } from "react-router-dom"
import { FileText, Download, ExternalLink, Plus } from "lucide-react"

import { DataTable, type Colonne } from "@/components/shared/DataTable"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formaterDate } from "@/lib/format"
import type { DocumentFichier } from "@/types/api"

const COLONNES: Colonne<DocumentFichier>[] = [
  { id: "nom", header: "Nom", cell: (d) => <span className="font-medium text-[var(--color-text-primary)]">{d.nom_fichier}</span>, primaire: true },
  { id: "type", header: "Type", cell: (d) => <Badge variant="outline">{d.type}</Badge> },
  { id: "version", header: "Version", cell: (d) => <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">v{d.version}</span> },
  { id: "date", header: "Date", cell: (d) => <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">{formaterDate(d.created_at)}</span> },
  {
    id: "action",
    header: "Actions",
    cell: (d) => {
      return (
        <div className="flex items-center gap-1">
          <Link to={`/presidence/documents/${d.id}`} className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]" aria-label="Ouvrir le document">
            <ExternalLink size={14} />
          </Link>
          <a href={`/api/documents/${d.id}/telecharger`} className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]" download aria-label="Télécharger">
            <Download size={14} />
          </a>
        </div>
      )
    },
  },
]

export function DocumentsListePage() {
  const { utilisateur } = useAuth()
  const permissions = usePermissions()
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)

  const role = utilisateur?.role
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur'

  const { data, isLoading } = useQuery({
    queryKey: ["documents", { page, recherche: rechercheDebouncee }],
    queryFn: async () => {
      const reponse = await apiClient.get<{
        data: DocumentFichier[]
        meta: { page: number; limit: number; total: number; totalPages: number }
      }>(
        "/documents",
        { params: { page, limit: 25, recherche: rechercheDebouncee || undefined } },
      )
      return reponse.data
    },
  })

  return (
    <div>
      <PageHeader
        titre="Documents"
        description={data ? `${data.meta.total} document${data.meta.total > 1 ? "s" : ""} enregistré${data.meta.total > 1 ? "s" : ""}` : "Chargement…"}
        actions={
          permissions.peutTeleverser ? (
            <Link
              to={`${cheminBase}/documents/nouveau`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Téléverser un document
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
          placeholderRecherche="Rechercher un document…"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <div key={cle} className="h-12 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icone={FileText}
            titre={recherche ? "Aucun résultat pour cette recherche" : "Aucun document"}
            description={recherche ? "Essayez avec un autre terme de recherche." : "Aucun document n'a été téléversé."}
            action={
              !recherche && permissions.peutTeleverser ? (
                <Link
                  to={`${cheminBase}/documents/nouveau`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Téléverser un document
                </Link>
              ) : undefined
            }
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
