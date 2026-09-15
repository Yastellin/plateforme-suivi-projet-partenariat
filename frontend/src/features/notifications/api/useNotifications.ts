// src/features/notifications/api/useNotifications.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenaire } from "@/types/api"

export function useNotifications(filtres?: { lecture?: boolean }) {
  return useQuery({
    queryKey: ["notifications", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Partenaire>("/notifications", {
        params: filtres || {},
      })
      return reponse.data
    },
  })
}