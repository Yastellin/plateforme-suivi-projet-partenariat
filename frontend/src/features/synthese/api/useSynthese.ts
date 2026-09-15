// src/features/synthese/api/useSynthese.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useSynthese(filtres?: { etablissement_id?: string }) {
  return useQuery({
    queryKey: ["synthese", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>("/synthese", {
        params: filtres || {},
      })
      return reponse.data
    },
  })
}