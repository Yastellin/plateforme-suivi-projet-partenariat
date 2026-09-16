// src/features/partenaires/api/useCreatePartenaire.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export interface PayloadPartenaire {
  nom: string
  type: string
  pays: string
  adresse?: string
  telephone?: string
  email?: string
  site_web?: string
  description?: string
  statut: string
  visibilite: string
  est_strategique: boolean
}

export function useCreatePartenaire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadPartenaire) => {
      const reponse = await apiClient.post<Partenaire>("/partenaires", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenaires"] })
    },
  })
}
