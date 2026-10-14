// src/features/synthese/api/useSyntheseGlobale.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SyntheseGlobale } from '@/types/api';
import { normaliserSyntheseGlobale } from '../lib/synthese';

export async function recupererSyntheseGlobale(annee: number): Promise<SyntheseGlobale> {
  const reponse = await apiClient.get<SyntheseGlobale>('/synthese', { params: { annee } });
  return normaliserSyntheseGlobale(reponse.data, annee);
}

/** GET /synthese?annee= : synthèse de tous les établissements. */
export function useSyntheseGlobale(annee: number) {
  return useQuery({
    queryKey: ['synthese', 'globale', { annee }],
    queryFn: () => recupererSyntheseGlobale(annee),
  });
}
