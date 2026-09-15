// src/features/conventions/api/useUpdateConvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PayloadConvention } from "./useCreateConvention"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useUpdateConvention(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<PayloadConvention>) => {
      const reponse = await apiClient.patch<Partenaire>(`/conventions/${id}`, payload)
      return reponse.data
    },
    onSuccess: (convention) => {
      queryClient.setQueryData(["conventions", id], convention)
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}