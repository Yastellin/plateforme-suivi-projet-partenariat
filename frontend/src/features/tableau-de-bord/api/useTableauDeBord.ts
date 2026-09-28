// src/features/tableau-de-bord/api/useTableauDeBord.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { CompteursTableauDeBord } from '@/types/api';

async function recupererTableauDeBord(): Promise<CompteursTableauDeBord> {
  const reponse = await apiClient.get<CompteursTableauDeBord>('/tableau-de-bord');
  return reponse.data;
}

export function useTableauDeBord() {
  return useQuery({
    queryKey: ['tableau-de-bord'],
    queryFn: recupererTableauDeBord,
  });
}