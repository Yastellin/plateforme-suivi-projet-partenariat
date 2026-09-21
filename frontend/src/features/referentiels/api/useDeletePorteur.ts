// src/features/referentiels/api/useDeletePorteur.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useDeletePorteur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/referentiels/porteurs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "porteurs"] })
    },
  })
}
