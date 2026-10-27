// src/features/espace-public/api/usePublicDonneesDetail.ts
// Lectures publiques utilisees par les pages de liste et de detail (projets,
// partenariats, partenaires). Toutes les donnees viennent de l'API publique.
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { PageServeur, PartenairePublic, ProjetPublic } from "@/types/api"

export interface PartenariatPublic {
  id: string
  intitule: string
  objet: string | null
  domaine: string
  date_debut: string
  date_fin: string | null
  etablissements: { id: string; nom: string; sigle: string | null; logo_url: string | null }[]
  partenaires: { id: string; nom: string; logo_url: string | null }[]
}

export function usePublicProjetsPublies() {
  return useQuery({
    queryKey: ["public-projets-publies"],
    queryFn: async () => (await apiClient.get<ProjetPublic[]>("/public/projets/publies")).data,
  })
}

export function usePublicPartenariatsPublies() {
  return useQuery({
    queryKey: ["public-partenariats-publies"],
    queryFn: async () => (await apiClient.get<PartenariatPublic[]>("/public/partenariats")).data,
  })
}

export function usePublicTousPartenaires() {
  return useQuery({
    queryKey: ["public-partenaires-tous"],
    queryFn: async () =>
      (await apiClient.get<PageServeur<PartenairePublic>>("/public/partenaires", { params: { limit: 100 } })).data
        .data,
  })
}
