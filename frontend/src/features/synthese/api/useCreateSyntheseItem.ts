// src/features/synthese/api/useCreateSyntheseItem.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { SyntheseItem } from "@/types/api"

interface PayloadSyntheseItem {
  etablissement_id: string
  annee: number
  type: string
  valeur: string
}

export function useCreateSyntheseItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: PayloadSyntheseItem) => {
      const reponse = await apiClient.post<SyntheseItem>("/synthese/items", valeurs)
      return reponse.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["synthese", { etablissement_id: variables.etablissement_id, annee: variables.annee }],
      })
    },
  })
}