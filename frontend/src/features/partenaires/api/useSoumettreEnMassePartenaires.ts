// src/features/partenaires/api/useSoumettreEnMassePartenaires.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

type ResultatSoumissionEnMasse = {
  total: number
  reussis: string[]
  echecs: { id: string; erreur: string }[]
}

async function soumettreEnMasse(ids: string[]): Promise<ResultatSoumissionEnMasse> {
  const reponse = await apiClient.post<ResultatSoumissionEnMasse>("/partenaires/soumettre", {
    ids,
  })
  return reponse.data
}

export function useSoumettreEnMassePartenaires() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: soumettreEnMasse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenaires"] })
    },
  })
}
