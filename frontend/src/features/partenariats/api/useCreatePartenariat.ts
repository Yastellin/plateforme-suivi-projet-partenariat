// src/features/partenariats/api/useCreatePartenariat.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadPartenariat {
  nom: string
  type: string
  etablissement_id: string
  convention_id?: string
  statut: string
}

export function useCreatePartenariat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadPartenariat) => {
      const reponse = await apiClient.post<Partenaire>("/partenariats", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenariats"] })
    },
  })
}