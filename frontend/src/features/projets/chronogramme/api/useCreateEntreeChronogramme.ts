// src/features/projets/chronogramme/api/useCreateEntreeChronogramme.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

interface PayloadEntreeChronogramme {
  annee: number
  trimestre: number
  mois: number
  nombre_jours: number
}

export function useCreateEntreeChronogramme(activiteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: PayloadEntreeChronogramme) => {
      const reponse = await apiClient.post(`/activites/${activiteId}/chronogramme`, valeurs)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activites", activiteId, "chronogramme"] })
    },
  })
}