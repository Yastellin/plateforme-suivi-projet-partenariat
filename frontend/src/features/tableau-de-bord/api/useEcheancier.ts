// src/features/tableau-de-bord/api/useEcheancier.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { EcheanceProchaine } from '@/types/api';

async function recupererEcheancier(): Promise<EcheanceProchaine[]> {
  const reponse = await apiClient.get<EcheanceProchaine[]>('/tableau-de-bord/echeancier');
  return reponse.data;
}

export function useEcheancier() {
  return useQuery({
    queryKey: ['tableau-de-bord', 'echeancier'],
    queryFn: recupererEcheancier,
  });
}