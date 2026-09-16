// src/features/conventions/api/useUpdateEtapeCircuit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Convention, EtapeCircuit } from "@/types/api"

export function useUpdateEtapeCircuit(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (etape: EtapeCircuit) => {
      const reponse = await apiClient.patch<Convention>(`/conventions/${id}/etape-circuit`, { etape_circuit: etape })
      return reponse.data
    },
    onSuccess: (convention) => {
      queryClient.setQueryData(["conventions", id], convention)
      queryClient.invalidateQueries({ queryKey: ["conventions"] })
    },
  })
}