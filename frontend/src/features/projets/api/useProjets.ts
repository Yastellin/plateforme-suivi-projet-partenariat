// src/features/projets/api/useProjets.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PageServeur, Projet } from '@/types/api';

interface ParametresProjets {
  page: number;
  limit: number;
  recherche?: string;
}

async function recupererProjets(parametres: ParametresProjets): Promise<PageServeur<Projet>> {
  const reponse = await apiClient.get<PageServeur<Projet>>('/projets', {
    params: {
      page: parametres.page,
      limit: parametres.limit,
      nom: parametres.recherche || undefined,
    },
  });
  return reponse.data;
}

export function useProjets(parametres: ParametresProjets) {
  return useQuery({
    queryKey: ['projets', 'liste', parametres],
    queryFn: () => recupererProjets(parametres),
    placeholderData: (precedent) => precedent,
  });
}