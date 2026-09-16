// src/features/documents/api/useVersionsDocument.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { DocumentFichier } from "@/types/api"

export function useVersionsDocument(id: string | undefined) {
  return useQuery({
    queryKey: ["documents", id, "versions"],
    queryFn: async () => {
      const reponse = await apiClient.get<DocumentFichier[]>(`/documents/${id}/versions`)
      return reponse.data
    },
    enabled: !!id,
  })
}