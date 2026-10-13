// src/features/publications/api/usePublication.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, Publication } from "@/types/api"

// Charge la publication associee a un projet (relation un-avec-un).
// L'API n'expose pas GET /publications/projet/:id : on passe par le
// filtre projet_id de la liste et on prend le premier resultat.
export function usePublication(projetId: string | undefined) {
  return useQuery({
    queryKey: ["publications", "projet", projetId],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Publication>>("/publications", {
        params: { projet_id: projetId, limit: 1 },
      })
      // React Query v5 refuse undefined : aucun resultat => null (creation).
      return reponse.data.data[0] ?? null
    },
    enabled: !!projetId,
  })
}