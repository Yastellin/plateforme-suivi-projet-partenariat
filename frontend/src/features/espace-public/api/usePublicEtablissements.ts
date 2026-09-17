// src/features/espace-public/api/usePublicEtablissements.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Etablissement, PageServeur } from "@/types/api"

export interface FiltresPublicEtablissements {
  page?: number
  limit?: number
  recherche?: string
}

// Liste publique des etablissements membres (page /etablissements).
// Le backend ne renvoie que les fiches marquees visibles publiquement.
export function usePublicEtablissements(filtres: FiltresPublicEtablissements = {}) {
  return useQuery({
    queryKey: ["public-etablissements", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Etablissement>>("/public/etablissements", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}