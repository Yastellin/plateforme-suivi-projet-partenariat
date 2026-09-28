// src/features/partenaires/api/useArchiverPartenaire.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenaire } from '@/types/api';

async function archiverPartenaire(id: string): Promise<Partenaire> {
  const reponse = await apiClient.post<Partenaire>(`/partenaires/${id}/archiver`);
  return reponse.data;
}

export function useArchiverPartenaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiverPartenaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partenaires'] });
    },
  });
}