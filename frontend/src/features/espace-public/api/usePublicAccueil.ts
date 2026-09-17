// src/features/espace-public/api/usePublicAccueil.ts
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Etablissement, Partenaire, Publication } from "@/types/api"

export interface CompteursPublics {
  nombre_etablissements: number
  nombre_partenaires: number
  nombre_pays_partenaires: number
  nombre_projets_actifs: number
}

export interface DonneesAccueilPublic {
  compteurs: CompteursPublics
  etablissements_a_la_une: Etablissement[]
  partenaires_a_la_une: Partenaire[]
  dernieres_publications: Publication[]
}

// Point d'entree unique de la vitrine publique (section 3) : compteurs +
// contenus mis en avant, consommes par <HeroAccueil>, <SectionEtablissements>
// et <SectionPartenaires>. Endpoint public, sans authentification.
export function usePublicAccueil() {
  return useQuery({
    queryKey: ["public-accueil"],
    queryFn: async () => {
      const reponse = await apiClient.get<DonneesAccueilPublic>("/public/accueil")
      return reponse.data
    },
    staleTime: 60_000,
  })
}