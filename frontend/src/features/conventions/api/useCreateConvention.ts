// src/features/conventions/api/useCreateConvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadConvention {
  nom: string
  description?: string
  etablissement_id: string
  statut: string
  visibilite: string
  etape_circuit: string
}

export function useCreateConvention() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadConvention) => {
      const reponse = await apiClient.post<Partenaire>("/conventions", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}