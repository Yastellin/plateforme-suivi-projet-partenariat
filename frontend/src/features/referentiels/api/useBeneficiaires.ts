// src/features/referentiels/api/useBeneficiaires.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Beneficiaire } from "@/types/api"

export function useBeneficiaires(filtres?: { recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "beneficiaires", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<Beneficiaire[]>(
        "/referentiels/beneficiaires",
        { params: filtres },
      )
      return reponse.data
    },
  })
}
