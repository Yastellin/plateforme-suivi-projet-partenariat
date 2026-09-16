// src/features/projets/activites/api/useActivites.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Activite } from "@/types/api"

export function useActivites(projetId: string | undefined) {
  return useQuery({
    queryKey: ["projets", projetId, "activites"],
    queryFn: async () => {
      const reponse = await apiClient.get<Activite[]>(`/projets/${projetId}/activites`)
      return reponse.data
    },
    enabled: !!projetId,
  })
}