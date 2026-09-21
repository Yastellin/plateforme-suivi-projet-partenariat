// src/features/referentiels/api/useCreateSite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Site } from "@/types/api"

export function useCreateSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (donnees: { nom: string; description?: string }) => {
      const reponse = await apiClient.post<Site>("/referentiels/sites", donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "sites"] })
    },
  })
}
