// src/features/tableau-de-bord/api/useTableauDeBord.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { CompteursTableauDeBord, StatutProjet, TableauDeBordReponse } from '@/types/api';

export interface CompteursEtendus extends CompteursTableauDeBord {
  conventions_signees: number;
  projets_par_statut: Record<StatutProjet, number>;
  partenariats: number;
  cotutelles: number;
  publications: number;
}

async function recupererTableauDeBord(): Promise<CompteursEtendus> {
  const reponse = await apiClient.get<TableauDeBordReponse>('/tableau-de-bord');
  const { compteurs, conventions_par_statut, projets_par_statut } = reponse.data;

  const repartition = compteurs?.repartition_conventions ?? {
    BROUILLON: 0,
    EN_ATTENTE_SIGNATURE: 0,
    SIGNEE: 0,
    ACTIVE: 0,
    SUSPENDUE: 0,
    EXPIREE: 0,
  };

  const projetsParStatut: Record<StatutProjet, number> = {
    BROUILLON: projets_par_statut?.BROUILLON ?? 0,
    EN_ATTENTE: projets_par_statut?.EN_ATTENTE ?? 0,
    EN_COURS: projets_par_statut?.EN_COURS ?? 0,
    SUSPENDU: projets_par_statut?.SUSPENDU ?? 0,
    EXPIRE: projets_par_statut?.EXPIRE ?? 0,
    TERMINE: projets_par_statut?.TERMINE ?? 0,
  };

  const signees = (repartition.SIGNEE ?? 0) + (repartition.ACTIVE ?? 0);

  return {
    partenaires_actifs: compteurs?.partenaires_actifs ?? compteurs?.partenaires ?? 0,
    partenaires: compteurs?.partenaires ?? 0,
    projets_en_cours: compteurs?.projets_en_cours ?? 0,
    projets: compteurs?.projets ?? 0,
    conventions_actives: compteurs?.conventions_actives ?? conventions_par_statut?.actives ?? repartition.ACTIVE ?? 0,
    conventions_a_echeance: compteurs?.conventions_a_echeance ?? conventions_par_statut?.bientot_expirees ?? 0,
    conventions_signees: compteurs?.conventions_signees ?? signees,
    repartition_conventions: repartition,
    projets_par_statut: projetsParStatut,
    partenariats: compteurs?.partenariats ?? 0,
    cotutelles: compteurs?.cotutelles ?? 0,
    publications: compteurs?.publications ?? 0,
  };
}

export function useTableauDeBord() {
  return useQuery({
    queryKey: ['tableau-de-bord'],
    queryFn: recupererTableauDeBord,
  });
}
