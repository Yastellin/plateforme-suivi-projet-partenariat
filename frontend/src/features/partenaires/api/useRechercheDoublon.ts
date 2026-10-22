// src/features/partenaires/api/useRechercheDoublon.ts

import { useQueries, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenaire } from '@/types/api';
import type { DoublonCoordonnee } from './useRechercheDoublonContact';

export type PartenaireAvecRaisons = Partenaire & { raisons_doublon?: string[] };
export type ResultatDoublonPartenaire = PartenaireAvecRaisons | DoublonCoordonnee;
type ChampRechercheDoublon = 'nom' | 'email' | 'telephone';

function estResultatDoublon(valeur: unknown): valeur is ResultatDoublonPartenaire {
  if (typeof valeur !== 'object' || valeur === null) return false;

  const candidat = valeur as Record<string, unknown>;
  return (
    typeof candidat.id === 'string' &&
    (typeof candidat.nom === 'string' ||
      typeof candidat.proprietaire_id === 'string')
  );
}

/**
 * Adapte les réponses anciennes, paginées ou doublement enveloppées au contrat
 * stable attendu par les formulaires : toujours un tableau de doublons.
 */
export function normaliserResultatsDoublons(
  valeur: unknown,
): ResultatDoublonPartenaire[] {
  let contenu = valeur;

  for (let profondeur = 0; profondeur < 3; profondeur += 1) {
    if (Array.isArray(contenu)) {
      return contenu.filter(estResultatDoublon);
    }
    if (
      typeof contenu === 'object' &&
      contenu !== null &&
      'data' in contenu
    ) {
      contenu = contenu.data;
      continue;
    }
    break;
  }

  return Array.isArray(contenu) ? contenu.filter(estResultatDoublon) : [];
}

async function rechercherDoublonPartenaire(
  champ: ChampRechercheDoublon,
  valeur: string,
  contexte?: { pays?: string; type?: string; etablissement_id?: string },
): Promise<ResultatDoublonPartenaire[]> {
  const reponse = await apiClient.get<unknown>('/partenaires/recherche-doublon', {
    params: { [champ]: valeur, ...contexte },
  });
  return normaliserResultatsDoublons(reponse.data);
}

function seuilAtteint(champ: ChampRechercheDoublon, valeur: string): boolean {
  if (champ === 'nom') return valeur.trim().length >= 3;
  if (champ === 'email') return valeur.includes('@') && valeur.includes('.');
  return valeur.replace(/\D/g, '').length >= 8;
}

export function useRechercheDoublon(
  champ: ChampRechercheDoublon,
  valeur: string,
  contexte?: { pays?: string; type?: string; etablissement_id?: string },
) {
  return useQuery({
    queryKey: ['partenaires', 'recherche-doublon', champ, valeur, contexte],
    queryFn: () => rechercherDoublonPartenaire(champ, valeur, contexte),
    select: normaliserResultatsDoublons,
    enabled: seuilAtteint(champ, valeur),
    staleTime: 30_000,
  });
}

export function useRechercheDoublonsPartenaireCoordonnees(
  emails: string[],
  telephones: string[],
) {
  const recherches = [
    ...emails.map((valeur) => ({ champ: 'email' as const, valeur })),
    ...telephones.map((valeur) => ({ champ: 'telephone' as const, valeur })),
  ];
  const requetes = useQueries({
    queries: recherches.map(({ champ, valeur }) => ({
      queryKey: ['partenaires', 'recherche-doublon', champ, valeur],
      queryFn: () => rechercherDoublonPartenaire(champ, valeur),
      select: normaliserResultatsDoublons,
      enabled: seuilAtteint(champ, valeur),
      staleTime: 30_000,
    })),
  });
  return {
    data: requetes.flatMap((requete) => requete.data ?? []),
    isFetching: requetes.some((requete) => requete.isFetching),
  };
}
