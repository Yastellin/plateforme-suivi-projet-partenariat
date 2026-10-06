// src/features/tableau-de-bord/api/useActiviteMensuelle.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface PointActiviteMensuelle {
  mois: string;
  conventions_signees: number;
  projets_soumis: number;
}

/**
 * Hook prêt à brancher sur `GET /tableau-de-bord/activite-mensuelle`.
 * Tant que l'API n'existe pas, renvoie un tableau vide (état propre, jamais de données factices).
 */
export function useActiviteMensuelle() {
  return useQuery({
    queryKey: ['tableau-de-bord', 'activite-mensuelle'],
    queryFn: async () => {
      try {
        const reponse = await apiClient.get<PointActiviteMensuelle[]>('/tableau-de-bord/activite-mensuelle');
        return reponse.data ?? [];
      } catch {
        return [];
      }
    },
    retry: false,
  });
}
