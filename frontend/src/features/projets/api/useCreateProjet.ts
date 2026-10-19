import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { preparerPayloadProjet, type ProjetFormValues } from "@/lib/validators/projet.schema"
import type { Projet } from "@/types/api"

export function useCreateProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: ProjetFormValues) => {
      const payload = preparerPayloadProjet(valeurs)
      const reponse = await apiClient.post<Projet>("/projets", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}