// src/features/synthese/api/useCreateSyntheseItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SyntheseItem } from '@/types/api';

export interface PayloadSyntheseItem {
  etablissement_id: string;
  annee: number;
  type: string;
  valeur: string;
}

async function creerItemSynthese(valeurs: PayloadSyntheseItem): Promise<SyntheseItem> {
  const reponse = await apiClient.post<SyntheseItem>('/synthese/items', valeurs);
  return reponse.data;
}

/**
 * POST /synthese/items — réservé à la Présidence.
 * Un conflit 409 signifie qu'un item de ce type existe déjà pour
 * l'établissement et l'année (un seul item par type et par année).
 */
export function useCreateSyntheseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creerItemSynthese,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
    onError: () => {
      // En cas de 409, les données locales sont périmées : on les rafraîchit.
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
  });
}
