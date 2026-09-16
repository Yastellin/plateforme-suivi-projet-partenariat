// src/features/projets/api/useProjet.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Projet } from "@/types/api"

export function useProjet(id: string | undefined) {
  return useQuery({
    queryKey: ["projets", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Projet>(`/projets/${id}`)
      return reponse.data
    },
    enabled: !!id,
  })
}