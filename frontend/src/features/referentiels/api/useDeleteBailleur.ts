// src/features/referentiels/api/useDeleteBailleur.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useDeleteBailleur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/referentiels/bailleurs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "bailleurs"] })
    },
  })
}
