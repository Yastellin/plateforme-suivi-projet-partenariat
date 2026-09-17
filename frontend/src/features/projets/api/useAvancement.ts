// src/features/projets/api/useAvancement.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

interface Avancement {
  pourcentage: number
  activites_terminees: number
  activites_total: number
}

export function useAvancement(projetId: string | undefined) {
  return useQuery({
    queryKey: ["projets", projetId, "avancement"],
    queryFn: async () => {
      const reponse = await apiClient.get<Avancement>(`/projets/${projetId}/avancement`)
      return reponse.data
    },
    enabled: !!projetId,
  })
}