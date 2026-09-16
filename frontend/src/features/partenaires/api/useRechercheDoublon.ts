// src/features/partenaires/api/useRechercheDoublon.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

// Recherche d'un partenaire existant avant toute creation afin d'eviter
// les doublons (cahier des charges 5.4). Renvoie le partenaire s'il existe.
export function useRechercheDoublon(nom: string | undefined) {
  return useQuery({
    queryKey: ["partenaires", "doublon", nom],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire | null>("/partenaires/recherche-doublon", {
        params: { nom },
      })
      return reponse.data
    },
    enabled: !!nom && nom.trim().length >= 2,
  })
}
