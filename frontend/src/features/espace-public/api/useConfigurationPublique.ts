import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export interface ConfigurationPublique {
  logo_url: string | null
}

export function useConfigurationPublique() {
  return useQuery({
    queryKey: ["public", "configuration"],
    queryFn: async () =>
      (await apiClient.get<ConfigurationPublique>("/public/configuration"))
        .data,
    staleTime: 5 * 60 * 1000,
  })
}
