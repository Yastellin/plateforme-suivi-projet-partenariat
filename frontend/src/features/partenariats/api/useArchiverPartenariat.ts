// src/features/partenariats/api/useArchiverPartenariat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenariat } from '@/types/api';

async function archiverPartenariat(id: string): Promise<Partenariat> {
  const reponse = await apiClient.post<Partenariat>(`/partenariats/${id}/archiver`);
  return reponse.data;
}

<<<<<<< Updated upstream
export function useArchiverPartenariat(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.post(`/partenariats/${id}/archiver`)
      return reponse.data
    },
=======
export function useArchiverPartenariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiverPartenariat,
>>>>>>> Stashed changes
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partenariats'] });
    },
  });
}