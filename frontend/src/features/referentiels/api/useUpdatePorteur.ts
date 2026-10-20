// src/features/referentiels/api/useUpdatePorteur.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Porteur } from "@/types/api"

export function useUpdatePorteur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, donnees }: { id: string; donnees: { nom: string; institution_rattachement?: string } }) => {
      const reponse = await apiClient.patch<Porteur>(`/referentiels/porteurs/${id}`, donnees)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "porteurs"] })
    },
  })
}
