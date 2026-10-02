// src/features/tableau-de-bord/api/useEcheancier.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { EcheanceProchaine } from '@/types/api';

interface ReponseEcheancier {
  conventions_bientot_expirees: Array<{
    id: string;
    reference: string;
    titre: string;
    date_fin: string;
    jours_restants: number;
  }>;
  projets_en_retard: Array<{
    id: string;
    nom: string;
    date_fin_prevue: string;
    jours_de_retard: number;
  }>;
}

function convertir(brut: ReponseEcheancier): EcheanceProchaine[] {
  return brut.conventions_bientot_expirees.map((c) => ({
    id: c.id,
    reference: c.reference,
    titre: c.titre,
    date_fin: c.date_fin,
    jours_restants: c.jours_restants,
  }));
}

async function recupererEcheancier(): Promise<EcheanceProchaine[]> {
  const reponse = await apiClient.get<ReponseEcheancier>('/tableau-de-bord/echeancier');
  return convertir(reponse.data);
}

export function useEcheancier() {
  return useQuery({
    queryKey: ['tableau-de-bord', 'echeancier'],
    queryFn: recupererEcheancier,
  });
}