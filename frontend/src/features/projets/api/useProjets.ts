// src/features/projets/api/useProjets.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Projet } from "@/types/api"

export interface FiltresProjets {
  page?: number
  limit?: number
  nom?: string
  statut?: string
  etablissement_id?: string
  partenariat_id?: string
  partenaire_id?: string
}

export function useProjets(filtres: FiltresProjets) {
  return useQuery({
    queryKey: ["projets", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Projet>>("/projets", { params: filtres })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}