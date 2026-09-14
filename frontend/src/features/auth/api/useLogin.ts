// src/features/auth/api/useLogin.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { ConnexionFormValues } from "@/lib/validators/auth.schema"
import type { ReponseConnexion } from "@/types/api"

export function useLogin() {
  return useMutation({
    mutationFn: async (valeurs: ConnexionFormValues) => {
      const reponse = await apiClient.post<ReponseConnexion>("/auth/login", valeurs)
      return reponse.data
    },
  })
}