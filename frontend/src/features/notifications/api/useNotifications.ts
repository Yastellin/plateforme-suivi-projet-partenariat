// src/features/notifications/api/useNotifications.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Notification } from "@/types/api"

export function useNotifications(filtres?: { est_lue?: boolean }) {
  return useQuery({
    queryKey: ["notifications", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Notification[]>("/notifications", {
        params: filtres,
      })
      return reponse.data
    },
  })
}