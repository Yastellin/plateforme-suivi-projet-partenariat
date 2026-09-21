// src/features/referentiels/api/useCreateBeneficiaire.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Beneficiaire } from "@/types/api"

export function useCreateBeneficiaire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (donnees: { nom: string; categorie?: string }) => {
      const reponse = await apiClient.post<Beneficiaire>("/referentiels/beneficiaires", donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "beneficiaires"] })
    },
  })
}
