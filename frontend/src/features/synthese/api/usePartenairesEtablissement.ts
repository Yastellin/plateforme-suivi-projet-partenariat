// src/features/synthese/api/usePartenairesEtablissement.ts
//
// Alimente le sélecteur de désignation d'un partenaire stratégique.
// Le backend filtre d'office les partenaires d'un compte ETABLISSEMENT ;
// pour la Présidence, `etablissement_id` est transmis mais le filtrage par
// établissement est appliqué côté client (voir SynthesePartenairesStrategiques).
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PageServeur, Partenaire } from '@/types/api';

export interface FiltresPartenairesSynthese {
  etablissement_id?: string;
  recherche?: string;
  limit?: number;
}

export async function recupererPartenairesPourSynthese(
  filtres: FiltresPartenairesSynthese,
): Promise<PageServeur<Partenaire>> {
  const reponse = await apiClient.get<PageServeur<Partenaire>>('/partenaires', {
    params: {
      page: 1,
      limit: filtres.limit ?? 100,
      nom: filtres.recherche || undefined,
      etablissement_id: filtres.etablissement_id || undefined,
    },
  });

  const donnees = Array.isArray(reponse.data?.data) ? reponse.data.data : [];
  return {
    data: donnees,
    meta:
      reponse.data?.meta ?? { page: 1, limit: filtres.limit ?? 100, total: donnees.length, totalPages: 1 },
  };
}

export function usePartenairesEtablissement(filtres: FiltresPartenairesSynthese) {
  return useQuery({
    queryKey: ['partenaires', 'synthese-selection', filtres],
    queryFn: () => recupererPartenairesPourSynthese(filtres),
    enabled: Boolean(filtres.etablissement_id),
    placeholderData: (precedent) => precedent,
  });
}
