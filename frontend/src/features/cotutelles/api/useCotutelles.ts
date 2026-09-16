// src/features/cotutelles/api/useCotutelles.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { CotutelleThese, PageServeur } from "@/types/api"

export interface FiltresCotutelles {
  page?: number
  limit?: number
  nom?: string
  etablissement_id?: string
}

// Liste paginee cote serveur
export function useCotutelles(filtres: FiltresCotutelles) {
  return useQuery({
    queryKey: ["cotutelles", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<CotutelleThese>>("/cotutelles", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}