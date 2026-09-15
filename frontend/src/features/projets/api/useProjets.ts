// src/features/projets/api/useProjets.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresProjets {
  page?: number
  limit?: number
  nom?: string
  statut?: string
  bailleur?: string
  beneficiaire?: string
  site?: string
}

// Liste paginee cote serveur : une seule requete pour toute la page
export function useProjets(filtres: FiltresProjets) {
  return useQuery({
    queryKey: ["projets", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/projets", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}
