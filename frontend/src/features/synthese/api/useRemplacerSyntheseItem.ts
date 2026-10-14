// src/features/synthese/api/useRemplacerSyntheseItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SyntheseItem } from '@/types/api';

export interface PayloadRemplacementSyntheseItem {
  item_id: string;
  etablissement_id: string;
  annee: number;
  type: string;
  valeur: string;
}

/**
 * Le backend n'expose pas de PATCH sur les items de synthèse (un seul item
 * par établissement/année/type) : remplacer une valeur revient donc à
 * supprimer l'item existant puis à en créer un nouveau.
 *
 * Si la recréation échoue, l'ancien item a déjà été supprimé : l'écran
 * conserve la valeur saisie pour permettre une nouvelle tentative.
 */
async function remplacerItemSynthese(valeurs: PayloadRemplacementSyntheseItem): Promise<SyntheseItem> {
  await apiClient.delete(`/synthese/items/${valeurs.item_id}`);
  const reponse = await apiClient.post<SyntheseItem>('/synthese/items', {
    etablissement_id: valeurs.etablissement_id,
    annee: valeurs.annee,
    type: valeurs.type,
    valeur: valeurs.valeur,
  });
  return reponse.data;
}

export function useRemplacerSyntheseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: remplacerItemSynthese,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
  });
}
