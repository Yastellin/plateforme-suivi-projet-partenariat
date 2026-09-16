// src/features/activites/api/useActivites.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresActivites {
  page?: number
  limit?: number
  nom?: string
  statut?: string
  partenaire_id?: string
}

// Liste paginee cote serveur
export function useActivites(filtres: FiltresActivites) {
  return useQuery({
    queryKey: ["activites", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/activites", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}