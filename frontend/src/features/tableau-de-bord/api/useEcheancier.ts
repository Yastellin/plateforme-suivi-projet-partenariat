// src/features/tableau-de-bord/api/useEcheancier.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { EcheanceProchaine } from "@/types/api"

export function useEcheancier() {
  return useQuery({
    queryKey: ["tableau-de-bord", "echeancier"],
    queryFn: async () => {
      const reponse = await apiClient.get<EcheanceProchaine[]>("/tableau-de-bord/echeancier")
      return reponse.data
    },
  })
}