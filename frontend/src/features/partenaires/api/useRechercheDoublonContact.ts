// src/features/partenaires/api/useRechercheDoublonContact.ts

import { useQueries, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export type DoublonCoordonnee = {
  id: string;
  type: 'EMAIL' | 'TELEPHONE';
  proprietaire_type: 'PARTENAIRE' | 'CONTACT';
  proprietaire_id: string;
  proprietaire_nom: string;
};

type ChampRechercheDoublonContact = 'email' | 'telephone';

async function rechercherDoublonContact(
  partenaireId: string,
  champ: ChampRechercheDoublonContact,
  valeur: string,
): Promise<DoublonCoordonnee[]> {
  const reponse = await apiClient.get<DoublonCoordonnee[]>('/contacts/recherche-doublon', {
    params: { partenaire_id: partenaireId, [champ]: valeur },
  });
  return reponse.data;
}

function seuilAtteint(champ: ChampRechercheDoublonContact, valeur: string): boolean {
  if (champ === 'email') return valeur.includes('@') && valeur.includes('.');
  return valeur.replace(/\D/g, '').length >= 8;
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

/** Contrôle en parallèle toutes les coordonnées additionnelles d'un contact. */
export function useRechercheDoublonsContact(
  partenaireId: string,
  emails: string[],
  telephones: string[],
) {
  const recherches = [
    ...emails.map((valeur) => ({ champ: 'email' as const, valeur })),
    ...telephones.map((valeur) => ({ champ: 'telephone' as const, valeur })),
  ];
  const requetes = useQueries({
    queries: recherches.map(({ champ, valeur }) => ({
      queryKey: ['contacts', 'recherche-doublon', partenaireId, champ, valeur],
      queryFn: () => rechercherDoublonContact(partenaireId, champ, valeur),
      enabled: Boolean(partenaireId) && seuilAtteint(champ, valeur),
      staleTime: 30_000,
    })),
  });
  const data = requetes.flatMap((requete) => requete.data ?? []);
  return { data, isFetching: requetes.some((requete) => requete.isFetching) };
}
