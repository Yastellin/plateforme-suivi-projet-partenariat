// src/features/referentiels/api/useSites.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Site } from "@/types/api"

export function useSites(filtres?: { page?: number; limit?: number; recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "sites", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: Site[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/referentiels/sites",
        { params: filtres },
      )
      return reponse.data
    },
  })
}
