// src/features/referentiels/api/useBailleurs.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Bailleur } from "@/types/api"

export function useBailleurs(filtres?: { recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "bailleurs", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Bailleur[]>("/referentiels/bailleurs", {
        params: filtres,
      })
      return reponse.data
    },
  })
}
