// src/features/projets/api/useProjet.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Projet } from '@/types/api';

async function recupererProjet(id: string): Promise<Projet> {
  const reponse = await apiClient.get<Projet>(`/projets/${id}`);
  return reponse.data;
}

export function useProjet(id: string) {
  return useQuery({
    queryKey: ['projets', id],
    queryFn: () => recupererProjet(id),
    enabled: Boolean(id),
  });
}