// src/features/projets/api/useCreateProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadProjet {
  nom: string
  description?: string
  bailleur?: string
  beneficiaire?: string
  site?: string
  etablissement_id: string
}

export function useCreateProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadProjet) => {
      const reponse = await apiClient.post<Partenaire>("/projets", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}
