import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { preparerPayloadProjet, type ProjetFormValues } from "@/lib/validators/projet.schema"
import type { Projet } from "@/types/api"

export function useUpdateProjet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: Partial<ProjetFormValues>) => {
      const payload = preparerPayloadProjet(valeurs as ProjetFormValues)
      const reponse = await apiClient.patch<Projet>(`/projets/${id}`, payload)
      return reponse.data
    },
    onSuccess: (projet) => {
      queryClient.setQueryData(["projets", id], projet)
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}