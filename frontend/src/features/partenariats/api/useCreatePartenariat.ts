// src/features/partenariats/api/useCreatePartenariat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenariat } from '@/types/api';
import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import { construirePayloadPartenariat } from './construire-payload';

async function creerPartenariat(valeurs: PartenariatFormValues): Promise<Partenariat> {
  const reponse = await apiClient.post<Partenariat>('/partenariats', construirePayloadPartenariat(valeurs));
  return reponse.data;
}

export function useCreatePartenariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creerPartenariat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partenariats'] });
    },
  });
}