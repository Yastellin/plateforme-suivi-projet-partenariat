// src/features/synthese/api/useSynthese.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { SyntheseEtablissement } from "@/types/api"

export function useSynthese(filtres: { etablissement_id: string; annee: number }) {
  return useQuery({
    queryKey: ["synthese", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<SyntheseEtablissement>("/synthese", { params: filtres })
      return reponse.data
    },
    enabled: !!filtres.etablissement_id,
  })
}