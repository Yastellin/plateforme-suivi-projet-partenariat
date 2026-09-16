// src/features/projets/activites/api/useCreateActivite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Activite } from "@/types/api"

interface PayloadActivite {
  intitule: string
  ordre: number
  date_echeance?: string
}

export function useCreateActivite(projetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: PayloadActivite) => {
      const reponse = await apiClient.post<Activite>(`/projets/${projetId}/activites`, valeurs)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets", projetId, "activites"] })
      queryClient.invalidateQueries({ queryKey: ["projets", projetId, "avancement"] })
    },
  })
}