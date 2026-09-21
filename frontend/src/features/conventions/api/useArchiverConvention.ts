// src/features/conventions/api/useArchiverConvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useArchiverConvention() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/conventions/${id}/archiver`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}