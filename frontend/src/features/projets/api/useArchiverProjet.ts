// src/features/projets/api/useArchiverProjet.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Projet } from '@/types/api';

async function archiverProjet(id: string): Promise<Projet> {
  const reponse = await apiClient.post<Projet>(`/projets/${id}/archiver`);
  return reponse.data;
}

export function useArchiverProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiverProjet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] });
    },
  });
}