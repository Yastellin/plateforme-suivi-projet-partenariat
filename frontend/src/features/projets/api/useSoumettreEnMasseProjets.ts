// src/features/projets/api/useSoumettreEnMasseProjets.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

type ResultatSoumissionEnMasse = {
  total: number
  reussis: string[]
  echecs: { id: string; erreur: string }[]
}

async function soumettreEnMasse(ids: string[]): Promise<ResultatSoumissionEnMasse> {
  const reponse = await apiClient.post<ResultatSoumissionEnMasse>("/projets/soumettre", {
    ids,
  })
  return reponse.data
}

export function useSoumettreEnMasseProjets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: soumettreEnMasse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}
