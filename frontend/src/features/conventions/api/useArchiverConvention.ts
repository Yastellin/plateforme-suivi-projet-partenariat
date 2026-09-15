// src/features/conventions/api/useArchiverConvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useArchiverConvention(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.post(`/conventions/${id}/archiver`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}