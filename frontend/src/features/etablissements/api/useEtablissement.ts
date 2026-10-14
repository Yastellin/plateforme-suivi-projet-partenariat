// src/features/etablissements/api/useEtablissement.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Etablissement } from '@/types/api';

async function recupererEtablissement(id: string): Promise<Etablissement> {
  const reponse = await apiClient.get<Etablissement>(`/etablissements/${id}`);
  return reponse.data;
}

export function useEtablissement(id?: string) {
  return useQuery({
    queryKey: ['etablissements', id],
    queryFn: () => recupererEtablissement(id ?? ''),
    enabled: Boolean(id),
  });
}