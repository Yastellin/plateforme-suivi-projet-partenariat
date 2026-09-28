// src/features/tableau-de-bord/components/GraphiqueStatuts.tsx

import { Skeleton } from '@/components/ui/skeleton';
import { LIBELLES_STATUT_CONVENTION } from '@/lib/status-mappings';
import type { CompteursTableauDeBord, StatutConvention } from '@/types/api';

interface GraphiqueStatutsProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

const COULEUR_BARRE: Record<StatutConvention, string> = {
  BROUILLON: 'bg-[var(--color-text-secondary)]',
  EN_ATTENTE_SIGNATURE: 'bg-[var(--color-brand-moment)]',
  SIGNEE: 'bg-[var(--color-brand)]',
  ACTIVE: 'bg-[var(--color-brand)]',
  SUSPENDUE: 'bg-[var(--color-brand-moment)]',
  EXPIREE: 'bg-[var(--status-expire-fg)]',
};

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

  const total = Object.values(compteurs.repartition_conventions).reduce((somme, valeur) => somme + valeur, 0);

  return (
    <div className="flex flex-col gap-[15px]">
      {(Object.keys(compteurs.repartition_conventions) as StatutConvention[]).map((statut) => {
        const valeur = compteurs.repartition_conventions[statut];
        const pourcentage = total > 0 ? Math.round((valeur / total) * 100) : 0;
        const info = LIBELLES_STATUT_CONVENTION[statut];

        return (
          <div key={statut} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
            <span className="text-[12.5px] font-semibold">{info.libelle}</span>
            <span className="font-mono text-xs font-bold text-[var(--color-text-secondary)]">
              {valeur} ({pourcentage}%)
            </span>
            <div className="col-span-2 h-[9px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
              <div
                className={`h-full rounded-[var(--radius-sm)] ${COULEUR_BARRE[statut]}`}
                style={{ width: `${pourcentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}