// src/features/partenaires/api/usePartenaire.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenaire } from '@/types/api';

async function recupererPartenaire(id: string): Promise<Partenaire> {
  const reponse = await apiClient.get<Partenaire>(`/partenaires/${id}`);
  return reponse.data;
}

export function usePartenaire(id: string) {
  return useQuery({
    queryKey: ['partenaires', id],
    queryFn: () => recupererPartenaire(id),
    enabled: Boolean(id),
  });
}