// src/features/espace-public/api/usePublicPartenariats.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Partenariat } from "@/types/api"

async function recupererPartenariatsPublies(): Promise<Partenariat[]> {
  const reponse = await apiClient.get<Partenariat[]>("/public/partenariats")
  return reponse.data
}

export function usePublicPartenariats() {
  return useQuery({
    queryKey: ["public", "partenariats"],
    queryFn: recupererPartenariatsPublies,
  })
}
