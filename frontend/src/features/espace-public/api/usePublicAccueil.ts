// src/features/espace-public/api/usePublicAccueil.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { AccueilPublic } from '@/types/api';

async function recupererAccueilPublic(): Promise<AccueilPublic> {
  const reponse = await apiClient.get<AccueilPublic>('/public/accueil');
  return reponse.data;
}

export function usePublicAccueil() {
  return useQuery({
    queryKey: ['public', 'accueil'],
    queryFn: recupererAccueilPublic,
    retry: false,
  });
}