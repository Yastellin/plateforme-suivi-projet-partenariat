// src/features/tableau-de-bord/api/useTableauDeBord.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { CompteursTableauDeBord } from '@/types/api';

interface ReponseBrute {
  compteurs: {
    partenaires: number;
    partenariats: number;
    cotutelles: number;
    projets: number;
    conventions: number;
    publications: number;
    repartition_conventions: Record<string, number>;
  };
  projets_par_statut: Record<string, number>;
  conventions_par_statut: {
    actives: number;
    expirees: number;
    bientot_expirees: number;
    en_attente_signature: number;
  };
  perimetre: 'GLOBAL' | 'ETABLISSEMENT';
}

function convertir(brut: ReponseBrute): CompteursTableauDeBord {
  return {
    partenaires_actifs: brut.compteurs.partenaires,
    projets_en_cours: brut.projets_par_statut.EN_COURS ?? 0,
    conventions_actives: brut.conventions_par_statut.actives,
    conventions_a_echeance: brut.conventions_par_statut.bientot_expirees,
    repartition_conventions: brut.compteurs.repartition_conventions as CompteursTableauDeBord['repartition_conventions'],
  };
}

async function recupererTableauDeBord(): Promise<CompteursTableauDeBord> {
  const reponse = await apiClient.get<ReponseBrute>('/tableau-de-bord');
  return convertir(reponse.data);
}

export function useTableauDeBord() {
  return useQuery({
    queryKey: ['tableau-de-bord'],
    queryFn: recupererTableauDeBord,
  });
}