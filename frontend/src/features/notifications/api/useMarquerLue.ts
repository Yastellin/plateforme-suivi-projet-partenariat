// src/features/notifications/api/useMarquerLue.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useMarquerLue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/lue`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarquerToutLu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/tout-marquer-lu")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}