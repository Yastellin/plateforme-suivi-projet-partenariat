// src/features/publications/api/usePublication.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function usePublication(id: string | undefined) {
  return useQuery({
    queryKey: ["publications", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>(`/publications/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}