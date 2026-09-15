// src/features/cotutelles/api/useCotutelle.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useCotutelle(id: string | undefined) {
  return useQuery({
    queryKey: ["cotutelles", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>(`/cotutelles/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}