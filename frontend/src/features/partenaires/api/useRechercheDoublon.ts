// src/features/partenaires/api/useRechercheDoublon.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenaire } from '@/types/api';

async function rechercherDoublon(nom: string): Promise<Partenaire[]> {
  const reponse = await apiClient.get<Partenaire[]>('/partenaires/recherche-doublon', {
    params: { nom },
  });
  return reponse.data;
}

export function useRechercheDoublon(nom: string) {
  return useQuery({
    queryKey: ['partenaires', 'recherche-doublon', nom],
    queryFn: () => rechercherDoublon(nom),
    enabled: nom.trim().length >= 3,
  });
}