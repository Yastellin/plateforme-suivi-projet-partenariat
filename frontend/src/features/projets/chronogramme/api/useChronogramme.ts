// src/features/projets/chronogramme/api/useChronogramme.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

interface EntreeChronogramme {
  id: string
  annee: number
  trimestre: number
  mois: number
  nombre_jours: number
  activite_id: string
}

export function useChronogramme(activiteId: string | undefined) {
  return useQuery({
    queryKey: ["activites", activiteId, "chronogramme"],
    queryFn: async () => {
      const reponse = await apiClient.get<EntreeChronogramme[]>(`/activites/${activiteId}/chronogramme`)
      return reponse.data
    },
    enabled: !!activiteId,
  })
}