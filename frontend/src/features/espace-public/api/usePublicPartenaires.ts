// src/features/espace-public/api/usePublicPartenaires.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresPublicPartenaires {
  page?: number
  limit?: number
  recherche?: string
  pays?: string
  type?: string
}

// Liste publique des partenaires (page /partenaires). Le backend filtre
// deja sur visibilite = "PUBLIC" (RG cf. Partenaire.visibilite) : aucun
// filtre de statut/etablissement n'est expose cote client ici.
export function usePublicPartenaires(filtres: FiltresPublicPartenaires = {}) {
  return useQuery({
    queryKey: ["public-partenaires", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/public/partenaires", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}