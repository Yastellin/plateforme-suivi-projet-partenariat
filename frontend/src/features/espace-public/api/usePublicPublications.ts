// src/features/espace-public/api/usePublicPublications.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, PublicationPublique } from "@/types/api"

export interface FiltresPublicPublications {
  page?: number
  limit?: number
  recherche?: string
}

// Liste publique des publications (page /projets-partenariats et fil de
// la page d'accueil). Le backend ne renvoie que statut = "PUBLIEE".
export function usePublicPublications(filtres: FiltresPublicPublications = {}) {
  return useQuery({
    queryKey: ["public-publications", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<PublicationPublique>>("/public/publications", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}