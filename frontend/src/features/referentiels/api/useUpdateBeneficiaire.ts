// src/features/referentiels/api/useUpdateBeneficiaire.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Beneficiaire } from "@/types/api"

export function useUpdateBeneficiaire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, donnees }: { id: string; donnees: { nom: string; categorie?: string } }) => {
      const reponse = await apiClient.patch<Beneficiaire>(`/referentiels/beneficiaires/${id}`, donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "beneficiaires"] })
    },
  })
}
