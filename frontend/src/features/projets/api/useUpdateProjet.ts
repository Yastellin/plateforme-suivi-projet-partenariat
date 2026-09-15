// src/features/projets/api/useUpdateProjet.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PayloadProjet } from "./useCreateProjet"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useUpdateProjet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<PayloadProjet>) => {
      const reponse = await apiClient.patch<Partenaire>(`/projets/${id}`, payload)
      return reponse.data
    },
    onSuccess: (projet) => {
      queryClient.setQueryData(["projets", id], projet)
      queryClient.invalidateQueries({ queryKey: ["projets"] })
    },
  })
}
