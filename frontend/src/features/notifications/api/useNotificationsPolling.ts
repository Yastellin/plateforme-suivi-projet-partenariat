// src/features/notifications/api/useNotificationsPolling.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useVisibilityGuard } from "@/hooks/useVisibilityGuard"
import type { Notification } from "@/types/api"

const INTERVALLE_POLLING_MS = 45_000

export function useNotificationsPolling() {
  const estVisible = useVisibilityGuard()

  return useQuery({
    queryKey: ["notifications", "polling"],
    queryFn: async () => {
      const reponse = await apiClient.get<Notification[]>("/notifications", {
        params: { est_lue: false },
      })
      return reponse.data
    },
    // Ne relance jamais la requete si l'onglet est masque (section 2 du prompt)
    refetchInterval: estVisible ? INTERVALLE_POLLING_MS : false,
    refetchIntervalInBackground: false,
  })
}