// src/features/referentiels/api/useDeleteBeneficiaire.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useDeleteBeneficiaire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/referentiels/beneficiaires/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "beneficiaires"] })
    },
  })
}
