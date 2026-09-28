// src/features/referentiels/api/usePorteurs.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Porteur } from "@/types/api"

export function usePorteurs(filtres?: { page?: number; limit?: number; recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "porteurs", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: Porteur[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/referentiels/porteurs",
        { params: filtres },
      )
      return reponse.data
    },
  })
}
