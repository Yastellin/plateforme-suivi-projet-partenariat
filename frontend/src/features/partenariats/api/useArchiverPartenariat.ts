// src/features/partenariats/api/useArchiverPartenariat.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useArchiverPartenariat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const reponse = await apiClient.post(`/partenariats/${id}/archiver`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenariats"] })
    },
  })
}