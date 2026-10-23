// src/features/espace-public/api/usePublicPartenaires.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, PartenairePublic } from "@/types/api"

export interface FiltresPublicPartenaires {
  page?: number
  limit?: number
  recherche?: string
  pays?: string
  type?: string
}

// Partenaires visibles publiquement (visibilite PUBLIC et statut ACTIF).
export function usePublicPartenaires(filtres: FiltresPublicPartenaires = {}) {
  return useQuery({
    queryKey: ["public-partenaires", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<PartenairePublic>>("/public/partenaires", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}
