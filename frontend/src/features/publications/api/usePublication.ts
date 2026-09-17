// src/features/publications/api/usePublication.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Publication } from "@/types/api"

export function usePublication(projetId: string | undefined) {
  return useQuery({
    queryKey: ["publications", "projet", projetId],
    queryFn: async () => {
      const reponse = await apiClient.get<Publication>(`/publications/${projetId}`)
      return reponse.data
    },
    enabled: !!projetId,
  })
}