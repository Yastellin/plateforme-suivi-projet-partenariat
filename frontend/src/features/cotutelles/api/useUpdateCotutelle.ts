// src/features/cotutelles/api/useUpdateCotutelle.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PayloadCotutelle } from "./useCreateCotutelle"
import apiClient from "@/lib/api-client"
import type { CotutelleThese } from "@/types/api"

export function useUpdateCotutelle(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<PayloadCotutelle>) => {
      const reponse = await apiClient.patch<CotutelleThese>(`/cotutelles/${id}`, payload)
      return reponse.data
    },
    onSuccess: (cotutelle) => {
      queryClient.setQueryData(["cotutelles", id], cotutelle)
      queryClient.invalidateQueries({ queryKey: ["cotutelles"] })
    },
  })
}