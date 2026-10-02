// src/features/tableau-de-bord/api/useComparatifEtablissements.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ComparatifEtablissement } from '@/types/api';

interface ReponseComparatif {
  etablissements: Array<{
    etablissement_id: string;
    etablissement_nom: string;
    etablissement_sigle: string | null;
    partenaires: number;
    partenariats: number;
    projets: number;
    projets_actifs: number;
    cotutelles: number;
  }>;
}

function convertir(brut: ReponseComparatif): ComparatifEtablissement[] {
  return brut.etablissements.map((e) => ({
    etablissement_id: e.etablissement_id,
    etablissement_nom: e.etablissement_nom,
    partenaires: e.partenaires,
    projets_actifs: e.projets_actifs,
  }));
}

async function recupererComparatifEtablissements(): Promise<ComparatifEtablissement[]> {
  const reponse = await apiClient.get<ReponseComparatif>('/statistiques/comparatif-etablissements');
  return convertir(reponse.data);
}

export function useComparatifEtablissements() {
  return useQuery({
    queryKey: ['statistiques', 'comparatif-etablissements'],
    queryFn: recupererComparatifEtablissements,
  });
}