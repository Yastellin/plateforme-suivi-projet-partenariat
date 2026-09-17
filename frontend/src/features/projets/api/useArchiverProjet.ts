// src/features/projets/api/useArchiverProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useArchiverProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/projets/${id}/archiver`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}