// src/features/partenaires/api/useCreatePartenaire.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { videsEnNull } from '@/lib/payload';
import { normaliserTelephone } from '@/lib/phone';
import type { Partenaire } from '@/types/api';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

async function creerPartenaire(valeurs: PartenaireFormValues): Promise<Partenaire> {
  const { telephone, ...reste } = valeurs;

  const payload = {
    ...videsEnNull(reste),
    telephone: telephone ? normaliserTelephone(telephone) : null,
  };

  const reponse = await apiClient.post<Partenaire>('/partenaires', payload);
  return reponse.data;
}

export function useCreatePartenaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creerPartenaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partenaires'] });
    },
  });
}