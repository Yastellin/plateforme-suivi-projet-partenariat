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
  const reponse = await apiClient.get<PageServeur<Etablissement> | Etablissement[]>('/etablissements', {
    params: {
      page: parametres.page,
      limit: parametres.limit,
      recherche: parametres.recherche || undefined,
    },
  });
  if (Array.isArray(reponse.data)) {
    const recherche = parametres.recherche?.trim().toLocaleLowerCase('fr')
    const filtres = recherche
      ? reponse.data.filter((item) =>
          `${item.nom} ${item.sigle ?? ''}`.toLocaleLowerCase('fr').includes(recherche),
        )
      : reponse.data
    const page = parametres.page ?? 1
    const limit = parametres.limit ?? Math.max(filtres.length, 1)
    const debut = (page - 1) * limit
    return {
      data: filtres.slice(debut, debut + limit),
      meta: { page, limit, total: filtres.length, totalPages: Math.ceil(filtres.length / limit) },
    }
  }
  return reponse.data;
}

export function useEtablissements(parametres: ParametresEtablissements | boolean = {}) {
  const parametresNormaux = typeof parametres === 'boolean' ? {} : parametres;

  return useQuery({
    queryKey: ['etablissements', parametresNormaux],
    queryFn: () => recupererEtablissements(parametresNormaux),
  });
}