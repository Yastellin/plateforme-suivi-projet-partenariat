// src/features/comptes/api/useCompte.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Utilisateur } from "@/types/api"

export function useCompte() {
  return useQuery({
    queryKey: ["compte"],
    queryFn: async () => {
      const reponse = await apiClient.get<Utilisateur>("/compte")
      return reponse.data
    },
  })
}