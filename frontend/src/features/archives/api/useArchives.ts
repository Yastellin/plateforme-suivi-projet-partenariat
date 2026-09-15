// src/features/archives/api/useArchives.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useArchives(filtres?: { etablissement_id?: string }) {
  return useQuery({
    queryKey: ["archives", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>("/archives", {
        params: filtres || {},
      })
      return reponse.data
    },
  })
}