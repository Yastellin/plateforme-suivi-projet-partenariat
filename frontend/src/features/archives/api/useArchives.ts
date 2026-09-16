// src/features/archives/api/useArchives.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, TypeArchive } from "@/types/api"

export function useArchives<T>(type: TypeArchive, filtres?: { page?: number; limit?: number; recherche?: string }) {
  return useQuery({
    queryKey: ["archives", type, filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<T>>(`/archives/${type}`, {
        params: filtres,
      })
      return reponse.data
    },
  })
}