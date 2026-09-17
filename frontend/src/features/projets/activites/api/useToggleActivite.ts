// src/features/projets/activites/api/useToggleActivite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useToggleActivite(projetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activiteId: string) => {
      await apiClient.patch(`/activites/${activiteId}/terminer`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets", projetId, "activites"] })
      queryClient.invalidateQueries({ queryKey: ["projets", projetId, "avancement"] })
    },
  })
}