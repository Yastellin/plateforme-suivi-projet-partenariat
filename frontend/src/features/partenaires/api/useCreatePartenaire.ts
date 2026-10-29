// src/features/partenaires/api/useCreatePartenaire.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { videsEnNull } from '@/lib/payload';
import { normaliserTelephone } from '@/lib/phone';
import type { Partenaire } from '@/types/api';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

interface VariablesCreationPartenaire {
  valeurs: PartenaireFormValues;
  logo?: File;
}

export interface ResultatCreationPartenaire {
  partenaire: Partenaire;
  logoTeleverse: boolean;
}

async function creerPartenaire({
  valeurs,
  logo,
}: VariablesCreationPartenaire): Promise<ResultatCreationPartenaire> {
  const { telephone, ...reste } = valeurs;
  const payload = {
    ...videsEnNull(reste),
    telephone: telephone ? normaliserTelephone(telephone) : null,
  };

  const creation = await apiClient.post<Partenaire>('/partenaires', payload);
  if (!logo) {
    return { partenaire: creation.data, logoTeleverse: true };
  }

  const donnees = new FormData();
  donnees.append('fichier', logo);
  try {
    const televersement = await apiClient.post<Partenaire>(
      `/partenaires/${creation.data.id}/logo`,
      donnees,
    );
    return { partenaire: televersement.data, logoTeleverse: true };
  } catch {
    return { partenaire: creation.data, logoTeleverse: false };
  }
}

export function useCreatePartenaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creerPartenaire,
    onSuccess: ({ partenaire }) => {
      queryClient.invalidateQueries({ queryKey: ['partenaires'] });
      queryClient.setQueryData(['partenaires', partenaire.id], partenaire);
    },
  });
}
