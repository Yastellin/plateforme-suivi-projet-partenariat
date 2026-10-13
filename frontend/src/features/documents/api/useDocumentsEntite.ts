// src/features/documents/api/useDocumentsEntite.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { DocumentFichier } from "@/types/api"

interface CibleDocuments {
  projet_id?: string
  convention_id?: string
}

async function recupererDocuments(cible: CibleDocuments): Promise<DocumentFichier[]> {
  const reponse = await apiClient.get<{ data: DocumentFichier[] }>("/documents", {
    params: { limit: 100, projet_id: cible.projet_id, convention_id: cible.convention_id },
  })
  return reponse.data?.data ?? []
}

export function cleDocumentsEntite(cible: CibleDocuments) {
  return ["documents", cible]
}

export function useDocumentsEntite(cible: CibleDocuments) {
  return useQuery({
    queryKey: cleDocumentsEntite(cible),
    queryFn: () => recupererDocuments(cible),
    enabled: Boolean(cible.projet_id || cible.convention_id),
  })
}
