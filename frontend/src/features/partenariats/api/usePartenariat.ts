// src/features/partenariats/api/usePartenariat.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenariat } from "@/types/api"

export function usePartenariat(id: string | undefined) {
  return useQuery({
    queryKey: ["partenariats", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenariat>(`/partenariats/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}