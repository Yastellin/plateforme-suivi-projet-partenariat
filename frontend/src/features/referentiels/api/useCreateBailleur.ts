// src/features/referentiels/api/useCreateBailleur.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Bailleur } from "@/types/api"

export function useCreateBailleur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (donnees: { nom: string; description?: string }) => {
      const reponse = await apiClient.post<Bailleur>("/referentiels/bailleurs", donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "bailleurs"] })
    },
  })
}
