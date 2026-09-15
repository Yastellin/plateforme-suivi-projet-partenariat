// src/features/partenaires/api/usePartenaire.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function usePartenaire(id: string | undefined) {
  return useQuery({
    queryKey: ["partenaires", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>(`/partenaires/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}
