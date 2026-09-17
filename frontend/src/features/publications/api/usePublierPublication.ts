// src/features/publications/api/usePublierPublication.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Publication } from "@/types/api"

export function usePublierPublication(id: string, projetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.patch<Publication>(`/publications/${id}/publier`)
      return reponse.data
    },
    onSuccess: (publication) => {
      queryClient.setQueryData(["publications", "projet", projetId], publication)
    },
  })
}