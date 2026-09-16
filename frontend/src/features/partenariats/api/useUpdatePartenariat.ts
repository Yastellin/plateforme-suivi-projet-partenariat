// src/features/partenariats/api/useUpdatePartenariat.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PartenariatFormValues } from "@/lib/validators/partenariat.schema"
import type { Partenariat } from "@/types/api"

export function useUpdatePartenariat(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: Partial<PartenariatFormValues>) => {
      const reponse = await apiClient.patch<Partenariat>(`/partenariats/${id}`, valeurs)
      return reponse.data
    },
    onSuccess: (partenariat) => {
      queryClient.setQueryData(["partenariats", id], partenariat)
      queryClient.invalidateQueries({ queryKey: ["partenariats"] })
    },
  })
}