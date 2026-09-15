// src/features/chronogramme/api/useCreateEntreeChronogramme.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadEntreeChronogramme {
  date: string
  etape: string
  partenaire_id: string
  convention_id?: string
  notation?: number
  commentaire?: string
}

export function useCreateEntreeChronogramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadEntreeChronogramme) => {
      const reponse = await apiClient.post<Partenaire>("/chronogramme/entrees", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chronogramme"] })
    },
  })
}