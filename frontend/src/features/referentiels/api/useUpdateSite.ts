// src/features/referentiels/api/useUpdateSite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Site } from "@/types/api"

export function useUpdateSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, donnees }: { id: string; donnees: { nom: string; description?: string } }) => {
      const reponse = await apiClient.patch<Site>(`/referentiels/sites/${id}`, donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "sites"] })
    },
  })
}
