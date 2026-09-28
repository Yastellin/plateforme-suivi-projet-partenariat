// src/features/referentiels/api/useBeneficiaires.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Beneficiaire } from "@/types/api"

export function useBeneficiaires(filtres?: { page?: number; limit?: number; recherche?: string }) {
  return useQuery({
    queryKey: ["referentiels", "beneficiaires", filtres],
    queryFn: async () => {
      const reponse = await apiClient.get<{ data: Beneficiaire[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        "/referentiels/beneficiaires",
        { params: filtres },
      )
      return reponse.data
    },
  })
}
