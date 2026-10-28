import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Publication } from "@/types/api"

export interface ReponseImageCouverture {
  image_couverture_url: string | null
}

export async function televerserImageCouverture(
  publicationId: string,
  fichier: File,
): Promise<ReponseImageCouverture> {
  const formData = new FormData()
  formData.append("fichier", fichier)
  const reponse = await apiClient.post<ReponseImageCouverture>(
    `/publications/${publicationId}/couverture`,
    formData,
  )
  return reponse.data
}

export async function supprimerImageCouverture(
  publicationId: string,
): Promise<ReponseImageCouverture> {
  const reponse = await apiClient.delete<ReponseImageCouverture>(
    `/publications/${publicationId}/couverture`,
  )
  return reponse.data
}

function mettreAJourCache(
  queryClient: ReturnType<typeof useQueryClient>,
  projetId: string,
  reponse: ReponseImageCouverture,
) {
  queryClient.setQueryData<Publication | null>(
    ["publications", "projet", projetId],
    (publication) => publication
      ? { ...publication, image_couverture_url: reponse.image_couverture_url }
      : publication,
  )
  queryClient.invalidateQueries({ queryKey: ["publications"] })
  queryClient.invalidateQueries({ queryKey: ["public-publication"] })
  queryClient.invalidateQueries({ queryKey: ["public-publications"] })
}

export function useTeleverserImageCouverture(publicationId: string, projetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fichier: File) => televerserImageCouverture(publicationId, fichier),
    onSuccess: (reponse) => mettreAJourCache(queryClient, projetId, reponse),
  })
}

export function useSupprimerImageCouverture(publicationId: string, projetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => supprimerImageCouverture(publicationId),
    onSuccess: (reponse) => mettreAJourCache(queryClient, projetId, reponse),
  })
}
