// src/features/referentiels/api/useCreatePorteur.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Porteur } from "@/types/api"

export function useCreatePorteur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (donnees: { nom: string; institution_rattachement?: string }) => {
      const reponse = await apiClient.post<Porteur>("/referentiels/porteurs", donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "porteurs"] })
    },
  })
}
