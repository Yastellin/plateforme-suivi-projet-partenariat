// src/features/archives/api/useArchives.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { LigneArchive, ModeArchives, PageServeur, TypeArchive } from "@/types/api"

const TOUS_LES_TYPES: TypeArchive[] = [
  "partenaires",
  "partenariats",
  "projets",
  "conventions",
  "cotutelles",
  "documents",
]

// Un seul hook qui gere les deux modes :
// - mode === "tous" : fetch parallele des 6 endpoints, concatenation des
//   resultats avec un champ _type pour identifier l'entite d'origine.
// - mode === un type precis : un seul appel a /archives/{type}.
export function useArchives(
  mode: ModeArchives,
  filtres?: { page?: number; limit?: number; recherche?: string },
) {
  return useQuery({
    queryKey: ["archives", mode, filtres],
    queryFn: async () => {
      if (mode === "tous") {
        const reponses = await Promise.all(
          TOUS_LES_TYPES.map((type) =>
            apiClient.get<PageServeur<Record<string, unknown>>>(`/archives/${type}`, {
              params: filtres,
            }),
          ),
        )
        const items: LigneArchive[] = reponses.flatMap((r, i) =>
          r.data.data.map((item) => ({ ...item, _type: TOUS_LES_TYPES[i] })),
        )
        return {
          data: items,
          meta: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
        }
      }

      const reponse = await apiClient.get<PageServeur<Record<string, unknown>>>(
        `/archives/${mode}`,
        { params: filtres },
      )
      return reponse.data
    },
  })
}