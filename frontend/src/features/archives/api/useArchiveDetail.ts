import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { TypeArchive } from "@/types/api"

export function useArchiveDetail<T>(type: TypeArchive, id: string | undefined) {
  return useQuery({
    queryKey: ["archives", "detail", type, id],
    enabled: Boolean(type && id),
    queryFn: async () => {
      const reponse = await apiClient.get<T>(`/archives/${type}/${id}`)
      return reponse.data
    },
  })
}