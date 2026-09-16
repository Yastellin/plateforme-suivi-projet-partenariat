// src/features/publications/api/useCreatePublication.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PublicationFormValues } from "@/lib/validators/publication.schema"
import type { Publication } from "@/types/api"

export function useCreatePublication(projetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: PublicationFormValues) => {
      const reponse = await apiClient.post<Publication>("/publications", { ...valeurs, projet_id: projetId })
      return reponse.data
    },
    onSuccess: (publication) => {
      queryClient.setQueryData(["publications", "projet", projetId], publication)
    },
  })
}