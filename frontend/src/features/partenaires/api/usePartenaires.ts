// src/features/partenaires/api/usePartenaires.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PageServeur, Partenaire } from '@/types/api';

interface ParametresPartenaires {
  page: number;
  limit: number;
  recherche?: string;
}

async function recupererPartenaires(parametres: ParametresPartenaires): Promise<PageServeur<Partenaire>> {
  const reponse = await apiClient.get<PageServeur<Partenaire>>('/partenaires', {
    params: {
      page: parametres.page,
      limit: parametres.limit,
      nom: parametres.recherche || undefined,
    },
  });
  return reponse.data;
}

export function usePartenaires(parametres: ParametresPartenaires) {
  return useQuery({
    queryKey: ['partenaires', parametres],
    queryFn: () => recupererPartenaires(parametres),
    placeholderData: (precedent) => precedent,
  });
}