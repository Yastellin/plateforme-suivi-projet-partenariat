// src/features/etablissements/api/useEtablissements.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Etablissement } from '@/types/api';

async function recupererEtablissements(): Promise<Etablissement[]> {
  const reponse = await apiClient.get<Etablissement[]>('/etablissements');
  return reponse.data;
}

export function useEtablissements(actif: boolean = true) {
  return useQuery({
    queryKey: ['etablissements'],
    queryFn: recupererEtablissements,
    enabled: actif,
  });
}