// src/features/partenaires/api/useRechercheDoublonContact.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Contact } from '@/types/api';

type ChampRechercheDoublonContact = 'email' | 'telephone';

async function rechercherDoublonContact(
  partenaireId: string,
  champ: ChampRechercheDoublonContact,
  valeur: string,
): Promise<Contact[]> {
  const reponse = await apiClient.get<Contact[]>('/contacts/recherche-doublon', {
    params: { partenaire_id: partenaireId, [champ]: valeur },
  });
  return reponse.data;
}

function seuilAtteint(champ: ChampRechercheDoublonContact, valeur: string): boolean {
  if (champ === 'email') {
    return valeur.includes('@') && valeur.includes('.');
  }
  return valeur.trim().length > 0;
}

export function useRechercheDoublonContact(
  partenaireId: string,
  champ: ChampRechercheDoublonContact,
  valeur: string,
) {
  return useQuery({
    queryKey: ['contacts', 'recherche-doublon', partenaireId, champ, valeur],
    queryFn: () => rechercherDoublonContact(partenaireId, champ, valeur),
    enabled: Boolean(partenaireId) && seuilAtteint(champ, valeur),
    staleTime: 30_000,
  });
}