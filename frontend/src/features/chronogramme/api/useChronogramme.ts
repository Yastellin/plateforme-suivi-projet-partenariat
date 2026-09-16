// src/features/chronogramme/api/useChronogramme.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresChronogramme {
  page?: number
  limit?: number
  partenaire_id?: string
  convention_id?: string
}

// Liste paginee cote serveur
export function useChronogramme(filtres: FiltresChronogramme) {
  return useQuery({
    queryKey: ["chronogramme", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/chronogramme", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}