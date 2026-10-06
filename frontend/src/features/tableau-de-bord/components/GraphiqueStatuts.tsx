// src/features/tableau-de-bord/components/GraphiqueStatuts.tsx

import { Skeleton } from '@/components/ui/skeleton';
import { RepartitionBars, type LigneRepartition } from '@/components/shared/RepartitionBars';
import type { CompteursTableauDeBord } from '@/types/api';

interface GraphiqueStatutsProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

export function GraphiqueStatuts({ compteurs, chargement }: GraphiqueStatutsProps) {
  if (chargement || !compteurs) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  const repartition = compteurs.repartition_conventions;
  const signees = (repartition?.SIGNEE ?? 0) + (repartition?.ACTIVE ?? 0);
  const enAttente = (repartition?.EN_ATTENTE_SIGNATURE ?? 0) + (repartition?.BROUILLON ?? 0) + (repartition?.SUSPENDUE ?? 0);
  const expirees = repartition?.EXPIREE ?? 0;
  // « En circuit » : tonalité disponible mais pas de statut API confirmé — compteur à 0.
  const enCircuit = 0;

  const lignes: LigneRepartition[] = [
    { cle: 'signees', libelle: 'Signées', valeur: signees, ton: 'brand' },
    { cle: 'attente', libelle: 'En attente', valeur: enAttente, ton: 'warning' },
    { cle: 'circuit', libelle: 'En circuit', valeur: enCircuit, ton: 'circuit' },
    { cle: 'expirees', libelle: 'Expirées', valeur: expirees, ton: 'error' },
  ];

  return <RepartitionBars lignes={lignes} />;
}
