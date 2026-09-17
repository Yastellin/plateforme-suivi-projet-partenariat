// src/features/partenariats/api/useCreatePartenariat.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PartenariatFormValues } from "@/lib/validators/partenariat.schema"
import type { Partenariat } from "@/types/api"

export function useCreatePartenariat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: PartenariatFormValues) => {
      const reponse = await apiClient.post<Partenariat>("/partenariats", valeurs)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenariats"] })
    },
  })
}