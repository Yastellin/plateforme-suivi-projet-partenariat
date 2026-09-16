// src/features/conventions/api/useUpdateConvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { ConventionFormValues } from "@/lib/validators/convention.schema"
import type { Convention } from "@/types/api"

export function useUpdateConvention(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (valeurs: Partial<ConventionFormValues>) => {
      const reponse = await apiClient.patch<Convention>(`/conventions/${id}`, valeurs)
      return reponse.data
    },
    onSuccess: (convention) => {
      queryClient.setQueryData(["conventions", id], convention)
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}