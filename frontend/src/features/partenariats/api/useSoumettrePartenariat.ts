// src/features/partenariats/api/useSoumettrePartenariat.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useSoumettrePartenariat(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.post(`/partenariats/${id}/soumettre`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenariats"] })
    },
  })
}