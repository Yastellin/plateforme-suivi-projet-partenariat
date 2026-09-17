// src/features/partenariats/api/usePartenariats.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenariat } from "@/types/api"

export interface FiltresPartenariats {
  page?: number
  limit?: number
  intitule?: string
  domaine?: string
  statut?: string
  etablissement_id?: string
}

export function usePartenariats(filtres: FiltresPartenariats) {
  return useQuery({
    queryKey: ["partenariats", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenariat>>("/partenariats", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}