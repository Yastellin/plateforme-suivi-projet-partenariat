// src/features/partenariats/api/usePartenariats.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresPartenariats {
  page?: number
  limit?: number
  nom?: string
  type?: string
  statut?: string
  etablissement_id?: string
}

// Liste paginee cote serveur
export function usePartenariats(filtres: FiltresPartenariats) {
  return useQuery({
    queryKey: ["partenariats", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/partenariats", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}