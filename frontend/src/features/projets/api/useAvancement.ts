// src/features/projets/api/useAvancement.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useAvancement(id: string | undefined) {
  return useQuery({
    queryKey: ["projets", id, "avancement"],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>(`/projets/${id}/avancement`)
      return reponse.data
    },
    enabled: !!id,
  })
}
