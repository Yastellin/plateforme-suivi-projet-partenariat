// src/features/projets/api/useCreateProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { ProjetFormValues } from "@/lib/validators/projet.schema"
import type { Projet } from "@/types/api"

export function useCreateProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: ProjetFormValues) => {
      const reponse = await apiClient.post<Projet>("/projets", valeurs)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}