// src/features/conventions/api/useCreateConvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { ConventionFormValues } from "@/lib/validators/convention.schema"
import type { Convention } from "@/types/api"

export function useCreateConvention() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: ConventionFormValues) => {
      const reponse = await apiClient.post<Convention>("/conventions", valeurs)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}