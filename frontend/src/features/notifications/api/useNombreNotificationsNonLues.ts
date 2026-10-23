import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useVisibilityGuard } from "@/hooks/useVisibilityGuard"

const INTERVALLE_ACTUALISATION_MS = 45_000

interface NombreNotificationsNonLuesResponse {
  total: number
}

export function useNombreNotificationsNonLues() {
  const estVisible = useVisibilityGuard()

  return useQuery({
    queryKey: ["notifications", "non-lues", "count"],
    queryFn: async () => {
      const reponse = await apiClient.get<NombreNotificationsNonLuesResponse>(
        "/notifications/non-lues/count",
      )
      return reponse.data.total
    },
    refetchInterval: estVisible ? INTERVALLE_ACTUALISATION_MS : false,
    refetchIntervalInBackground: false,
  })
}
