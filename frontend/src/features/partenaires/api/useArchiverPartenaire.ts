// src/features/partenaires/api/useArchiverPartenaire.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

// RG26 : l'archivage n'est pas une suppression definitive - le partenaire
// reste consultable depuis les archives.
export function useArchiverPartenaire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const reponse = await apiClient.post(`/partenaires/${id}/archiver`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenaires"] })
      queryClient.invalidateQueries({ queryKey: ["archives"] })
    },
  })
}
