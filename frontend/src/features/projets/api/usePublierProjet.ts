// src/features/projets/api/usePublierProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Projet } from "@/types/api"

async function publierProjet(id: string): Promise<Projet> {
  const reponse = await apiClient.post<Projet>(`/projets/${id}/publier`)
  return reponse.data
}

export function usePublierProjet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => publierProjet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
      queryClient.invalidateQueries({ queryKey: ["projets", id] })
    },
  })
}
