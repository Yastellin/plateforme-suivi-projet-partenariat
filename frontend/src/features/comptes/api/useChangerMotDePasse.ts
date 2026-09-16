// src/features/comptes/api/useChangerMotDePasse.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { versPayloadChangerMotDePasse, type ChangerMotDePasseFormValues } from "@/lib/validators/compte.schema"

export function useChangerMotDePasse() {
  return useMutation({
    mutationFn: async (valeurs: ChangerMotDePasseFormValues) => {
      await apiClient.patch("/compte/mot-de-passe", versPayloadChangerMotDePasse(valeurs))
    },
  })
}