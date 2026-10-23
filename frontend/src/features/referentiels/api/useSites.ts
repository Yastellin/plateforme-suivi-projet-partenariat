// src/features/referentiels/api/useSites.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Site } from "@/types/api"

export function useSites(filtres?: { recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "sites", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Site[]>("/referentiels/sites", {
        params: filtres,
      })
      return reponse.data
    },
  })
}
