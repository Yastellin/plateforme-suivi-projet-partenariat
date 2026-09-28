// src/features/partenaires/api/useUpdatePartenaire.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { videsEnNull } from '@/lib/payload';
import { normaliserTelephone } from '@/lib/validators/phone.schema';
import type { Partenaire } from '@/types/api';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

interface VariablesUpdatePartenaire {
  id: string;
  valeurs: PartenaireFormValues;
}

async function mettreAJourPartenaire({ id, valeurs }: VariablesUpdatePartenaire): Promise<Partenaire> {
  const { telephone, etablissement_id: _etablissementId, ...reste } = valeurs;

  const payload = {
    ...videsEnNull(reste),
    telephone: telephone ? normaliserTelephone(telephone) : null,
  };

  const reponse = await apiClient.patch<Partenaire>(`/partenaires/${id}`, payload);
  return reponse.data;
}

export function useUpdatePartenaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mettreAJourPartenaire,
    onSuccess: (partenaire) => {
      queryClient.invalidateQueries({ queryKey: ['partenaires'] });
      queryClient.setQueryData(['partenaires', partenaire.id], partenaire);
    },
  });
}