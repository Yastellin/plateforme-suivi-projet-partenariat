// src/features/etablissements/api/useEtablissements.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface ParametresEtablissements {
  page?: number;
  limit?: number;
  recherche?: string;
}

async function recupererEtablissements(parametres?: ParametresEtablissements) {
  const reponse = await apiClient.get('/etablissements', { params: parametres });
  return reponse.data;
}

export function useEtablissements(parametresOrActif?: ParametresEtablissements | boolean) {
  const parametres = typeof parametresOrActif === 'object' ? parametresOrActif : undefined;
  const actif = typeof parametresOrActif === 'boolean' ? parametresOrActif : true;

  return useQuery({
    queryKey: ['etablissements', parametres],
    queryFn: () => recupererEtablissements(parametres),
    enabled: actif,
  });
}