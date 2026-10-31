// src/features/publications/api/useChangerStatutPublication.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Publication } from "@/types/api"

export type StatutCiblePublication = Publication["statut"]

/**
 * Publie (PUBLIEE) ou retire (BROUILLON) une publication via PATCH /publications/:id.
 * - Publier enregistre la date du jour.
 * - Retirer repasse en brouillon : la publication n'est pas supprimée.
 */
export function useChangerStatutPublication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: StatutCiblePublication }) => {
      const corps =
        statut === "PUBLIEE"
          ? { statut, date_publication: new Date().toISOString() }
          : { statut }
      const reponse = await apiClient.patch<Publication>(`/publications/${id}`, corps)
      return reponse.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["publications"] })
      void queryClient.invalidateQueries({ queryKey: ["public-publications"] })
    },
  })
}
