// src/features/partenaires/api/usePartenaires.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Partenaire } from "@/types/api"

export interface FiltresPartenaires {
  page?: number
  limit?: number
  nom?: string
  type?: string
  pays?: string
  statut?: string
  visibilite?: string
}

// Liste paginee cote serveur : une seule requete pour toute la page
// (section 2 : hooks partages pour eviter les rafales d'appels API).
export function usePartenaires(filtres: FiltresPartenaires) {
  return useQuery({
    queryKey: ["partenaires", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Partenaire>>("/partenaires", {
        params: filtres,
      })
      return reponse.data
    },
    placeholderData: keepPreviousData,
  })
}
