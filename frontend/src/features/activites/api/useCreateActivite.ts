// src/features/activites/api/useCreateActivite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadActivite {
  nom: string
  partenaire_id: string
  convention_id?: string
  statut: string
}

export function useCreateActivite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadActivite) => {
      const reponse = await apiClient.post<Partenaire>("/activites", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activites"] })
    },
  })
}