// src/features/synthese/api/useSyntheseEtablissement.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SyntheseEtablissement } from '@/types/api';
import { normaliserSyntheseEtablissement } from '../lib/synthese';

export async function recupererSyntheseEtablissement(
  etablissementId: string,
  annee: number,
): Promise<SyntheseEtablissement> {
  const reponse = await apiClient.get<SyntheseEtablissement>(`/synthese/${etablissementId}`, {
    params: { annee },
  });
  return normaliserSyntheseEtablissement(reponse.data, annee);
}

/** GET /synthese/:etablissementId?annee= : synthèse d'un établissement. */
export function useSyntheseEtablissement(etablissementId: string, annee: number) {
  return useQuery({
    queryKey: ['synthese', 'etablissement', etablissementId, { annee }],
    queryFn: () => recupererSyntheseEtablissement(etablissementId, annee),
    enabled: Boolean(etablissementId),
  });
}
