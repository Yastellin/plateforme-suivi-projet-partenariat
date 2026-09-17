// src/features/projets/api/useSoumettreProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useSoumettreProjet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/projets/${id}/soumettre`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
      queryClient.invalidateQueries({ queryKey: ["projets", id] })
    },
  })
}