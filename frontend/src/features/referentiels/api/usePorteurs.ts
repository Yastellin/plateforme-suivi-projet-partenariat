// src/features/referentiels/api/usePorteurs.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Porteur } from "@/types/api"

export function usePorteurs(filtres?: { recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "porteurs", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Porteur[]>("/referentiels/porteurs", {
        params: filtres,
      })
      return reponse.data
    },
  })
}
