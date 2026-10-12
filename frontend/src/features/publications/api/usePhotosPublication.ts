// src/features/publications/api/usePhotosPublication.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PhotoPublication } from "@/types/api"

/** Envoie une photo à une publication (le backend attend le champ « fichier »). */
export async function ajouterPhoto(
  publicationId: string,
  fichier: File,
  legende?: string,
): Promise<PhotoPublication> {
  const formData = new FormData()
  formData.append("fichier", fichier)
  if (legende) formData.append("legende", legende)

  const reponse = await apiClient.post<PhotoPublication>(`/publications/${publicationId}/photos`, formData)
  return reponse.data
}

export function useAjouterPhoto(publicationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fichier, legende }: { fichier: File; legende?: string }) =>
      ajouterPhoto(publicationId, fichier, legende),
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
