// src/features/partenariats/api/useUpdatePartenariat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenariat } from '@/types/api';
import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import { construirePayloadPartenariat } from './construire-payload';

interface VariablesUpdatePartenariat {
  id: string;
  valeurs: PartenariatFormValues;
}

async function mettreAJourPartenariat({ id, valeurs }: VariablesUpdatePartenariat): Promise<Partenariat> {
  const reponse = await apiClient.patch<Partenariat>(`/partenariats/${id}`, construirePayloadPartenariat(valeurs));
  return reponse.data;
}

export function useUpdatePartenariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mettreAJourPartenariat,
    onSuccess: (partenariat) => {
      queryClient.invalidateQueries({ queryKey: ['partenariats'] });
      queryClient.setQueryData(['partenariats', partenariat.id], partenariat);
    },
  });
}