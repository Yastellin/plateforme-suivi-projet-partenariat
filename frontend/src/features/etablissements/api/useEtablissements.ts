// src/features/etablissements/api/useEtablissements.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Etablissement } from "@/types/api"

export function useEtablissements(filtres?: { page?: number; limit?: number; recherche?: string }) {
  return useQuery({
    queryKey: ["etablissements", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: Etablissement[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/etablissements",
        { params: filtres },
      )
      return reponse.data
    },
  })
}
