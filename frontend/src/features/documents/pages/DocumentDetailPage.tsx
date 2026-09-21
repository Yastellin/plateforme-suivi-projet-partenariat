// src/features/documents/pages/DocumentDetailPage.tsx
import { useParams } from "react-router-dom"
import { FileText, Download } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { DocumentFichier } from "@/types/api"
import { DocumentVersionsListe } from "@/features/documents/components/DocumentVersionsListe"

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: document, isLoading } = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const reponse = await apiClient.get<DocumentFichier>(`/documents/${id}`)
      return reponse.data
    },
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6">
        <EmptyState icon={FileText} titre="Document introuvable" message="Ce document n'existe pas ou a ete supprime." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{document.nom_fichier}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline">{document.type}</Badge>
            <span className="font-data text-sm text-muted-foreground">Version {document.version}</span>
          </div>
        </div>
        <a
          href={`/api/documents/${document.id}/telecharger`}
          className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover"
          download
        >
          <Download size={14} />
          Telecharger
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Date de creation</span>
          <p className="font-data font-medium">{new Date(document.created_at).toLocaleDateString("fr-FR")}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Derniere modification</span>
          <p className="font-data font-medium">{new Date(document.updated_at).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      {document.projet_id && (
        <div>
          <span className="text-sm text-muted-foreground">Projet lie</span>
          <p className="text-sm font-medium">{document.projet_id}</p>
        </div>
      )}
      {document.convention_id && (
        <div>
          <span className="text-sm text-muted-foreground">Convention liee</span>
          <p className="text-sm font-medium">{document.convention_id}</p>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold">Historique des versions</h2>
        <DocumentVersionsListe documentId={document.id} />
      </div>
    </div>
  )
}
