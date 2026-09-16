// src/features/tableau-de-bord/api/useTableauDeBord.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useTableauDeBord() {
  return useQuery({
    queryKey: ["tableau-de-bord"],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>("/tableau-de-bord")
      return reponse.data
    },
  })
}