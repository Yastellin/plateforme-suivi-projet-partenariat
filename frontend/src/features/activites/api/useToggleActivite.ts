// src/features/activites/api/useToggleActivite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useToggleActivite(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.post(`/activites/${id}/toggle`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activites"] })
    },
  })
}