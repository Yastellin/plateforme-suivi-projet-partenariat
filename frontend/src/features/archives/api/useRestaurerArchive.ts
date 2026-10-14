import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { TypeArchive } from "@/types/api"

export function useRestaurerArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ type, id }: { type: TypeArchive; id: string }) => {
      const reponse = await apiClient.post(`/archives/${type}/${id}/restaurer`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archives"] })
    },
  })
}