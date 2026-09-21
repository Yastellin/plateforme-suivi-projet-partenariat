// src/features/etablissements/api/useEtablissement.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Etablissement } from "@/types/api"

export function useEtablissement(id: string | undefined) {
  return useQuery({
    queryKey: ["etablissements", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Etablissement>(`/etablissements/${id}`)
      return reponse.data
    },
    enabled: Boolean(id),
  })
}
