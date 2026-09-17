// src/features/synthese/api/useCreatePartenaireStrategique.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { SynthesePartenaireStrategique } from "@/types/api"

interface PayloadPartenaireStrategique {
  etablissement_id: string
  annee: number
  partenaire_id: string
}

export function useCreatePartenaireStrategique() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: PayloadPartenaireStrategique) => {
      const reponse = await apiClient.post<SynthesePartenaireStrategique>("/synthese/partenaires-strategiques", valeurs)
      return reponse.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["synthese", { etablissement_id: variables.etablissement_id, annee: variables.annee }],
      })
    },
  })
}