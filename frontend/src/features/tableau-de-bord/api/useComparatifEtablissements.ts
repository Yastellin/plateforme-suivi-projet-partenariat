// src/features/tableau-de-bord/api/useComparatifEtablissements.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ComparatifEtablissement } from '@/types/api';

async function recupererComparatifEtablissements(): Promise<ComparatifEtablissement[]> {
  const reponse = await apiClient.get<ComparatifEtablissement[]>('/statistiques/comparatif-etablissements');
  return reponse.data;
}

export function useComparatifEtablissements() {
  return useQuery({
    queryKey: ['statistiques', 'comparatif-etablissements'],
    queryFn: recupererComparatifEtablissements,
  });
}