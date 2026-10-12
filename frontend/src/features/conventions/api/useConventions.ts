// src/features/conventions/api/useConventions.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Convention } from "@/types/api"

export interface FiltresConventions {
  page?: number
  limit?: number
  reference?: string
  titre?: string
  statut?: string
  partenariat_id?: string
  projet_id?: string
  archive?: boolean
}

export function useConventions(filtres: FiltresConventions) {
  return useQuery({
    queryKey: ["conventions", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Convention>>("/conventions", { params: filtres })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}