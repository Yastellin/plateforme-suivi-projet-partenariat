// src/features/tableau-de-bord/api/useComparatifEtablissements.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ComparatifEtablissement } from '@/types/api';

async function recupererComparatifEtablissements(): Promise<ComparatifEtablissement[]> {
  const reponse = await apiClient.get<{ etablissements?: ComparatifEtablissement[] } | ComparatifEtablissement[]>(
    '/statistiques/comparatif-etablissements',
  );

  const donnees = Array.isArray(reponse.data) ? reponse.data : reponse.data?.etablissements ?? [];

  return donnees.map((etablissement) => ({
    ...etablissement,
    partenaires_actifs: etablissement.partenaires_actifs ?? etablissement.partenaires ?? 0,
    projets_en_cours: etablissement.projets_en_cours ?? etablissement.projets_actifs ?? etablissement.projets ?? 0,
  }));
}

export function useComparatifEtablissements() {
  return useQuery({
    queryKey: ['statistiques', 'comparatif-etablissements'],
    queryFn: recupererComparatifEtablissements,
  });
}