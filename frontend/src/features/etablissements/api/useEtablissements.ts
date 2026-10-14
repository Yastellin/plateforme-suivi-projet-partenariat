// src/features/etablissements/api/useEtablissements.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Etablissement, PageServeur } from '@/types/api';

interface ParametresEtablissements {
  page?: number;
  limit?: number;
  recherche?: string;
}

async function recupererEtablissements(parametres: ParametresEtablissements = {}): Promise<PageServeur<Etablissement>> {
  const reponse = await apiClient.get<PageServeur<Etablissement>>('/etablissements', {
    params: {
      page: parametres.page,
      limit: parametres.limit,
      recherche: parametres.recherche || undefined,
    },
  });
  return reponse.data;
}

export function useEtablissements(parametres: ParametresEtablissements | boolean = {}) {
  const parametresNormaux = typeof parametres === 'boolean' ? {} : parametres;

  return useQuery({
    queryKey: ['etablissements', parametresNormaux],
    queryFn: () => recupererEtablissements(parametresNormaux),
  });
}