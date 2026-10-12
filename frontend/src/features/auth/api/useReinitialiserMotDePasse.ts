// src/features/auth/api/useReinitialiserMotDePasse.ts

import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

interface Reinitialisation {
  token: string
  nouveauMotDePasse: string
}

export function useReinitialiserMotDePasse() {
  return useMutation({
    mutationFn: async ({ token, nouveauMotDePasse }: Reinitialisation) => {
      const reponse = await apiClient.post<{ message: string }>("/auth/reinitialiser-mot-de-passe", {
        token,
        nouveau_mot_de_passe: nouveauMotDePasse,
      })
      return reponse.data
    },
  })
}
