// src/features/synthese/api/useSyntheseItems.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ListeSyntheseItems, SyntheseItem } from '@/types/api';
import { normaliserItem } from '../lib/synthese';

export interface FiltresSyntheseItems {
  etablissement_id?: string;
  annee?: number;
  type?: string;
}

export async function recupererSyntheseItems(filtres: FiltresSyntheseItems): Promise<SyntheseItem[]> {
  const reponse = await apiClient.get<ListeSyntheseItems>('/synthese/items', {
    params: {
      etablissement_id: filtres.etablissement_id || undefined,
      annee: filtres.annee,
      type: filtres.type || undefined,
    },
  });

  const donnees = Array.isArray(reponse.data?.data) ? reponse.data.data : [];
  return donnees.map(normaliserItem).filter((item): item is SyntheseItem => item !== null);
}

/** GET /synthese/items : liste filtrée des éléments narratifs. */
export function useSyntheseItems(filtres: FiltresSyntheseItems = {}) {
  return useQuery({
    queryKey: ['synthese', 'items', filtres],
    queryFn: () => recupererSyntheseItems(filtres),
  });
}
