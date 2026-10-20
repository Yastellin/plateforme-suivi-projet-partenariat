// src/features/espace-public/api/usePublicProjets.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Projet } from "@/types/api"

async function recupererProjetsPublies(): Promise<Projet[]> {
  const reponse = await apiClient.get<Projet[]>("/public/projets")
  return reponse.data
}

export function usePublicProjets() {
  return useQuery({
    queryKey: ["public", "projets"],
    queryFn: recupererProjetsPublies,
  })
}
