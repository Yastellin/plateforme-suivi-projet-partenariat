// src/features/conventions/api/useConvention.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useConvention(id: string | undefined) {
  return useQuery({
    queryKey: ["conventions", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>(`/conventions/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}