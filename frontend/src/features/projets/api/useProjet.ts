// src/features/projets/api/useProjet.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useProjet(id: string | undefined) {
  return useQuery({
    queryKey: ["projets", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>(`/projets/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}
