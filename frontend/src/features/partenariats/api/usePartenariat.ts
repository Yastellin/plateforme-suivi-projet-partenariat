// src/features/partenariats/api/usePartenariat.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenariat } from '@/types/api';

async function recupererPartenariat(id: string): Promise<Partenariat> {
  const reponse = await apiClient.get<Partenariat>(`/partenariats/${id}`);
  return reponse.data;
}

export function usePartenariat(id: string) {
  return useQuery({
    queryKey: ['partenariats', id],
    queryFn: () => recupererPartenariat(id),
    enabled: Boolean(id),
  });
}