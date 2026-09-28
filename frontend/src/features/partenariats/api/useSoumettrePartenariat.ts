// src/features/partenariats/api/useSoumettrePartenariat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenariat } from '@/types/api';

async function soumettrePartenariat(id: string): Promise<Partenariat> {
  const reponse = await apiClient.post<Partenariat>(`/partenariats/${id}/soumettre`);
  return reponse.data;
}

export function useSoumettrePartenariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: soumettrePartenariat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partenariats'] });
    },
  });
}