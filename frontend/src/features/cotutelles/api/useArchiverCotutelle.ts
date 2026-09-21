// src/features/cotutelles/api/useArchiverCotutelle.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useArchiverCotutelle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/cotutelles/${id}/archiver`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotutelles"] })
    },
  })
}
