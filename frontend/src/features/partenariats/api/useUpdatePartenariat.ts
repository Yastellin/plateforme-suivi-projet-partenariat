// src/features/partenariats/api/useUpdatePartenariat.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PayloadPartenariat } from "./useCreatePartenariat"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useUpdatePartenariat(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<PayloadPartenariat>) => {
      const reponse = await apiClient.patch<Partenaire>(`/partenariats/${id}`, payload)
      return reponse.data
    },
    onSuccess: (partenariat) => {
      queryClient.setQueryData(["partenariats", id], partenariat)
      queryClient.invalidateQueries({ queryKey: ["partenariats"] })
    },
  })
}