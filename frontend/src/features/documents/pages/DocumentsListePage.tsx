// src/features/documents/pages/DocumentsListePage.tsx

import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
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
import { useTelechargerDocument } from "@/features/documents/api/useTelechargerDocument"
import {
  creerLienFicheDocument,
  lireCibleDocuments,
} from "@/features/documents/lib/cible-documents"

function ActionsDocument({ document, cheminBase }: { document: DocumentFichier; cheminBase: string }) {
  const telechargement = useTelechargerDocument()

  return (
    <div className="flex items-center gap-1">
      <Link to={`${cheminBase}/documents/${document.id}`} className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]" aria-label="Ouvrir le document">
        <ExternalLink size={14} />
      </Link>
      <button
        type="button"
        onClick={() => telechargement.mutate({ id: document.id, nomFichier: document.nom_fichier })}
        disabled={telechargement.isPending}
        className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)] disabled:opacity-50"
        aria-label={`Télécharger ${document.nom_fichier}`}
      >
        <Download size={14} />
      </button>
    </div>
  )
}

function construireColonnes(cheminBase: string): Colonne<DocumentFichier>[] {
  return [
    { id: "nom", header: "Nom", cell: (d) => <span className="font-medium text-[var(--color-text-primary)]">{d.nom_fichier}</span>, primaire: true },
    { id: "type", header: "Type", cell: (d) => <Badge variant="outline">{d.type}</Badge> },
    { id: "version", header: "Version", cell: (d) => <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">v{d.version}</span> },
    { id: "date", header: "Date", cell: (d) => <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">{formaterDate(d.created_at)}</span> },
    {
      id: "action",
      header: "Actions",
      cell: (document) => <ActionsDocument document={document} cheminBase={cheminBase} />,
    },
  ]
}

export function DocumentsListePage() {
  const { utilisateur } = useAuth()
  const permissions = usePermissions()
  const [searchParams] = useSearchParams()
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)
  const cibleDocuments = lireCibleDocuments(searchParams)

  const role = utilisateur?.role
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur'
  const filtresEntite = cibleDocuments
    ? { [cibleDocuments.parametre]: cibleDocuments.id }
    : {}

  const { data, isLoading } = useQuery({
    queryKey: ["documents", { page, recherche: rechercheDebouncee, filtresEntite }],
    queryFn: async () => {
      const reponse = await apiClient.get<{
        data: DocumentFichier[]
        meta: { page: number; limit: number; total: number; totalPages: number }
      }>(
        "/documents",
        { params: { page, limit: 25, nom: rechercheDebouncee || undefined, ...filtresEntite } },
      )
      return reponse.data
    },
  })

  const description = cibleDocuments
    ? `${data?.meta.total ?? 0} document${(data?.meta.total ?? 0) === 1 ? "" : "s"} lié${(data?.meta.total ?? 0) === 1 ? "" : "s"} ${cibleDocuments.formulation}`
    : data
      ? `${data.meta.total} document${data.meta.total > 1 ? "s" : ""} enregistré${data.meta.total > 1 ? "s" : ""}`
      : "Chargement…"

  return (
    <div>
      <PageHeader
        titre="Documents"
        description={description}
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

      {cibleDocuments ? (
        <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] px-4 py-3 text-[13px]">
          <span>
            Filtre actif : documents liés {cibleDocuments.formulation}.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={creerLienFicheDocument(cheminBase, cibleDocuments)}
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Retour à la fiche {cibleDocuments.libelle}
            </Link>
            <Link
              to={`${cheminBase}/documents`}
              className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:underline"
            >
              Afficher tous les documents
            </Link>
          </div>
        </div>
      ) : null}

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
            titre={recherche ? "Aucun résultat pour cette recherche" : cibleDocuments ? "Aucun document lié à cette fiche" : "Aucun document"}
            description={recherche ? "Essayez avec un autre terme de recherche." : cibleDocuments ? `Aucun document n'est rattaché ${cibleDocuments.formulation}.` : "Aucun document n'a été téléversé."}
            action={
              !recherche && !cibleDocuments && permissions.peutTeleverser ? (
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
            <DataTable colonnes={construireColonnes(cheminBase)} donnees={data.data} meta={data.meta} onPageChange={setPage} />
          </PanelBody>
        )}
      </Panel>
    </div>
  )
}
