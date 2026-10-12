// src/features/publications/api/usePhotosPublication.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PhotoPublication } from "@/types/api"

export function useAjouterPhoto(publicationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fichier, legende }: { fichier: File; legende?: string }) => {
      const formData = new FormData()
      // Nom de champ attendu par l'API (FileInterceptor('fichier'))
      formData.append("fichier", fichier)
      if (legende) formData.append("legende", legende)

      const reponse = await apiClient.post<PhotoPublication>(
        `/publications/${publicationId}/photos`,
        formData,
      )
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] })
    },
  })
}

export function useSupprimerPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (photoId: string) => {
      await apiClient.delete(`/photos/${photoId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] })
    },
  })
}
