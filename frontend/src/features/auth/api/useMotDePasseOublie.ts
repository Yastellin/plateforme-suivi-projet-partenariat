// src/features/auth/api/useMotDePasseOublie.ts

import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useMotDePasseOublie() {
  return useMutation({
    mutationFn: async (email: string) => {
      const reponse = await apiClient.post<{ message: string }>("/auth/mot-de-passe-oublie", { email })
      return reponse.data
    },
  })
}
