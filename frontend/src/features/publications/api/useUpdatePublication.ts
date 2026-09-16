// src/features/publications/api/useUpdatePublication.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PublicationFormValues } from "@/lib/validators/publication.schema"
import type { Publication } from "@/types/api"

export function useUpdatePublication(id: string, projetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: Partial<PublicationFormValues>) => {
      const reponse = await apiClient.patch<Publication>(`/publications/${id}`, valeurs)
      return reponse.data
    },
    onSuccess: (publication) => {
      queryClient.setQueryData(["publications", "projet", projetId], publication)
    },
  })
}