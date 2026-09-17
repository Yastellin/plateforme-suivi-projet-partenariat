// src/features/partenaires/api/useUpdatePartenaire.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"
import type { PayloadPartenaire } from "./useCreatePartenaire"

export function useUpdatePartenaire(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<PayloadPartenaire>) => {
      const reponse = await apiClient.patch<Partenaire>(`/partenaires/${id}`, payload)
      return reponse.data
    },
    onSuccess: (partenaire) => {
      queryClient.setQueryData(["partenaires", id], partenaire)
      queryClient.invalidateQueries({ queryKey: ["partenaires"] })
    },
  })
}
