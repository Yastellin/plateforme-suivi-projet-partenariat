// src/features/referentiels/api/useBailleurs.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Bailleur } from "@/types/api"

export function useBailleurs(filtres?: { page?: number; limit?: number; recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "bailleurs", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: Bailleur[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/referentiels/bailleurs",
        { params: filtres },
      )
      return reponse.data
    },
  })
}
