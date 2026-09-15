// src/features/conventions/api/useConventions.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresConventions {
  page?: number
  limit?: number
  nom?: string
  statut?: string
  etablissement_id?: string
}

// Liste paginee cote serveur : une seule requete pour toute la page
export function useConventions(filtres: FiltresConventions) {
  return useQuery({
    queryKey: ["conventions", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/conventions", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}