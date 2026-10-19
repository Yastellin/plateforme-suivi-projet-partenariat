// src/features/espace-public/api/usePublicProjets.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, ProjetPublic } from "@/types/api"

export interface FiltresPublicProjets {
  page?: number
  limit?: number
  recherche?: string
  etablissement_id?: string
}

// Projets de l'Universite (hors brouillons et projets expires), avec leurs
// partenaires publics. Le budget et les contacts ne sont jamais exposes.
export function usePublicProjets(filtres: FiltresPublicProjets = {}) {
  return useQuery({
    queryKey: ["public-projets", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<ProjetPublic>>("/public/projets", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}
