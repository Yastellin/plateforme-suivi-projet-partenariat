// src/features/conventions/api/useUpdateEtapeCircuit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useUpdateEtapeCircuit(id: string, etape: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.patch<Partenaire>(`/conventions/${id}/etape`, { etape })
      return reponse.data
    },
    onSuccess: (convention) => {
      queryClient.setQueryData(["conventions", id], convention)
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}