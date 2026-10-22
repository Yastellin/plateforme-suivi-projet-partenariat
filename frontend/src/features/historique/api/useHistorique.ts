import { useQuery } from "@tanstack/react-query";

import apiClient from "@/lib/api-client";
import type { PageServeur } from "@/types/api";

export type ActionHistorique =
  | "CREATION"
  | "MODIFICATION"
  | "SOUMISSION"
  | "PUBLICATION"
  | "ARCHIVAGE"
  | "RESTAURATION"
  | "SUPPRESSION";

export interface EntreeHistorique {
  id: string;
  utilisateur_id: string | null;
  utilisateur_nom: string | null;
  utilisateur_role: string | null;
  action: ActionHistorique;
  entite_type: string;
  entite_id: string | null;
  entite_nom: string | null;
  details: string | null;
  date_creation: string;
}

export interface FiltresHistorique {
  page?: number;
  limit?: number;
  recherche?: string;
  action?: ActionHistorique | "";
  entite_type?: string;
  date_debut?: string;
  date_fin?: string;
}

export function useHistorique(filtres: FiltresHistorique) {
  return useQuery({
    queryKey: ["historique", filtres],
    queryFn: async () =>
      (
        await apiClient.get<PageServeur<EntreeHistorique>>("/historique", {
          params: {
            ...filtres,
            recherche: filtres.recherche || undefined,
            action: filtres.action || undefined,
            entite_type: filtres.entite_type || undefined,
            date_debut: filtres.date_debut || undefined,
            date_fin: filtres.date_fin || undefined,
          },
        })
      ).data,
  });
}
