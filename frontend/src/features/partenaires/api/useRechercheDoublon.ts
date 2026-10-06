// src/features/partenaires/api/useRechercheDoublon.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Partenaire } from '@/types/api';

type ChampRechercheDoublon = 'nom' | 'email' | 'telephone';

async function rechercherDoublonPartenaire(champ: ChampRechercheDoublon, valeur: string): Promise<Partenaire[]> {
  const reponse = await apiClient.get<Partenaire[]>('/partenaires/recherche-doublon', {
    params: { [champ]: valeur },
  });
  return reponse.data;
}

function seuilAtteint(champ: ChampRechercheDoublon, valeur: string): boolean {
  if (champ === 'nom') {
    return valeur.trim().length >= 3;
  }
  if (champ === 'email') {
    return valeur.includes('@') && valeur.includes('.');
  }
  return valeur.trim().length > 0;
}

export function useRechercheDoublon(champ: ChampRechercheDoublon, valeur: string) {
  return useQuery({
    queryKey: ['partenaires', 'recherche-doublon', champ, valeur],
    queryFn: () => rechercherDoublonPartenaire(champ, valeur),
    enabled: seuilAtteint(champ, valeur),
    staleTime: 30_000,
  });
}