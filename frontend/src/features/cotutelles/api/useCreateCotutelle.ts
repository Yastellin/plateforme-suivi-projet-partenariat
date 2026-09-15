// src/features/cotutelles/api/useCreateCotutelle.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadCotutelle {
  nom: string
  etablissement_id: string
  convention_id?: string
  statut: string
}

export function useCreateCotutelle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadCotutelle) => {
      const reponse = await apiClient.post<Partenaire>("/cotutelles", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotutelles"] })
    },
  })
}