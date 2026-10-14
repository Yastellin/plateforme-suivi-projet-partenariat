// src/features/synthese/api/useCreatePartenaireStrategique.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SynthesePartenaireStrategique } from '@/types/api';

export interface PayloadPartenaireStrategique {
  etablissement_id: string;
  annee: number;
  partenaire_id: string;
}

async function creerPartenaireStrategique(
  valeurs: PayloadPartenaireStrategique,
): Promise<SynthesePartenaireStrategique> {
  const reponse = await apiClient.post<SynthesePartenaireStrategique>(
    '/synthese/partenaires-strategiques',
    valeurs,
  );
  return reponse.data;
}

/**
 * POST /synthese/partenaires-strategiques — réservé à la Présidence.
 * Un conflit 409 signifie que le partenaire est déjà désigné pour
 * l'établissement et l'année.
 */
export function useCreatePartenaireStrategique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creerPartenaireStrategique,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
  });
}
