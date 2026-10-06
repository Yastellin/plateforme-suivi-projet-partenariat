// src/features/notifications/api/useNotifications.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Notification } from "@/types/api"

export interface NotificationsApiResponse {
  data: Notification[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export function normalizeNotificationsResponse(responseData: unknown): Notification[] {
  if (Array.isArray(responseData)) {
    return responseData as Notification[]
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    Array.isArray((responseData as { data?: unknown }).data)
  ) {
    return (responseData as { data: Notification[] }).data
  }

  return []
}

export function useNotifications(filtres?: { est_lue?: boolean }) {
  return useQuery({
    queryKey: ["notifications", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<NotificationsApiResponse>("/notifications", {
        params: filtres,
      })
      return normalizeNotificationsResponse(reponse.data)
    },
  })
}