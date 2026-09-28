// src/features/referentiels/api/useUpdateBailleur.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Bailleur } from "@/types/api"

export function useUpdateBailleur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, donnees }: { id: string; donnees: { nom: string; description?: string } }) => {
      const reponse = await apiClient.patch<Bailleur>(`/referentiels/bailleurs/${id}`, donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "bailleurs"] })
    },
  })
}
