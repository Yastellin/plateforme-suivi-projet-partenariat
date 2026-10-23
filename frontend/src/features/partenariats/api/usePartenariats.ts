// src/features/partenariats/api/usePartenariats.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PageServeur, Partenariat } from '@/types/api';

interface ParametresPartenariats {
  page: number;
  limit: number;
  recherche?: string;
  etablissement_id?: string;
}

async function recupererPartenariats(parametres: ParametresPartenariats): Promise<PageServeur<Partenariat>> {
  const reponse = await apiClient.get<PageServeur<Partenariat>>('/partenariats', {
    params: {
      page: parametres.page,
      limit: parametres.limit,
      intitule: parametres.recherche || undefined,
      etablissement_id: parametres.etablissement_id,
    },
  });
  return reponse.data;
}

export function usePartenariats(parametres: ParametresPartenariats) {
  return useQuery({
    queryKey: ['partenariats', 'liste', parametres],
    queryFn: () => recupererPartenariats(parametres),
    placeholderData: (precedent) => precedent,
  });
}