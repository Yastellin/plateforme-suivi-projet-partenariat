// src/features/projets/api/useUpdateProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { ProjetFormValues } from "@/lib/validators/projet.schema"
import type { Projet } from "@/types/api"

export function useUpdateProjet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: Partial<ProjetFormValues>) => {
      const reponse = await apiClient.patch<Projet>(`/projets/${id}`, valeurs)
      return reponse.data
    },
    onSuccess: (projet) => {
      queryClient.setQueryData(["projets", id], projet)
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}