// src/features/tableau-de-bord/api/useEcheancier.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { EcheanceProchaine } from '@/types/api';

interface EcheancierReponse {
  conventions_bientot_expirees: EcheanceProchaine[];
  projets_en_retard: unknown[];
}

async function recupererEcheancier(): Promise<EcheanceProchaine[]> {
  const reponse = await apiClient.get<EcheancierReponse>('/tableau-de-bord/echeancier');
  return reponse.data.conventions_bientot_expirees;
}

export function useEcheancier() {
  return useQuery({
    queryKey: ['tableau-de-bord', 'echeancier'],
    queryFn: recupererEcheancier,
  });
}