// src/features/espace-public/api/usePublicEtablissements.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { EtablissementPublic, PageServeur } from "@/types/api"

export interface FiltresPublicEtablissements {
  page?: number
  limit?: number
  recherche?: string
}

// Etablissements membres de l'Universite.
export function usePublicEtablissements(filtres: FiltresPublicEtablissements = {}) {
  return useQuery({
    queryKey: ["public-etablissements", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<EtablissementPublic>>("/public/etablissements", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}
