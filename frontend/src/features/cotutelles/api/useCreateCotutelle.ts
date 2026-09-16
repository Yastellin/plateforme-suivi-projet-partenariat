// src/features/cotutelles/api/useCreateCotutelle.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { CotutelleThese } from "@/types/api"
import type { CotutelleFormValues } from "@/lib/validators/cotutelle.schema"

export type PayloadCotutelle = CotutelleFormValues

export function useCreateCotutelle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadCotutelle) => {
      const reponse = await apiClient.post<CotutelleThese>("/cotutelles", payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotutelles"] })
    },
  })
}