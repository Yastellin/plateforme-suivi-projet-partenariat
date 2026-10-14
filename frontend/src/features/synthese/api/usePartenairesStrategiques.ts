// src/features/synthese/api/usePartenairesStrategiques.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SynthesePartenaireStrategique } from '@/types/api';
import { normaliserPartenaireStrategique } from '../lib/synthese';

export interface FiltresPartenairesStrategiques {
  etablissement_id?: string;
  annee?: number;
}

export async function recupererPartenairesStrategiques(
  filtres: FiltresPartenairesStrategiques,
): Promise<SynthesePartenaireStrategique[]> {
  const reponse = await apiClient.get<unknown[]>('/synthese/partenaires-strategiques', {
    params: {
      etablissement_id: filtres.etablissement_id || undefined,
      annee: filtres.annee,
    },
  });

  const donnees = Array.isArray(reponse.data) ? reponse.data : [];
  return donnees
    .map(normaliserPartenaireStrategique)
    .filter((partenaire): partenaire is SynthesePartenaireStrategique => partenaire !== null);
}

/** GET /synthese/partenaires-strategiques : désignations filtrées. */
export function usePartenairesStrategiques(filtres: FiltresPartenairesStrategiques = {}) {
  return useQuery({
    queryKey: ['synthese', 'partenaires-strategiques', filtres],
    queryFn: () => recupererPartenairesStrategiques(filtres),
  });
}
