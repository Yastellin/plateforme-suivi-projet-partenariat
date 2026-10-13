// src/components/shared/RepartitionBars.tsx

import { cn } from '@/lib/utils';

export type TonRepartition = 'brand' | 'warning' | 'circuit' | 'error';

export interface LigneRepartition {
  cle: string;
  libelle: string;
  valeur: number;
  ton?: TonRepartition;
}

const CLASSES_TON: Record<TonRepartition, string> = {
  brand: 'bg-[var(--chart-brand)]',
  warning: 'bg-[var(--chart-warning)]',
  circuit: 'bg-[var(--chart-circuit)]',
  error: 'bg-[var(--chart-error)]',
};

interface RepartitionBarsProps {
  lignes: LigneRepartition[];
  total?: number;
}

export function RepartitionBars({ lignes, total }: RepartitionBarsProps) {
  const somme = total ?? lignes.reduce((acc, ligne) => acc + ligne.valeur, 0);

  return (
    <div className="flex flex-col gap-[13px]">
      {lignes.map((ligne) => {
        const pourcentage = somme > 0 ? Math.round((ligne.valeur / somme) * 100) : 0;
        const ton = ligne.ton ?? 'brand';

        return (
          <div key={ligne.cle} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
            <span className="text-[12.5px] font-semibold">{ligne.libelle}</span>
            <span className="font-mono text-xs font-bold text-[var(--color-text-secondary)]">
              {ligne.valeur} ({pourcentage}%)
            </span>
            <div className="col-span-2 h-[9px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
              <div
                className={cn('h-full rounded-[var(--radius-sm)]', CLASSES_TON[ton])}
                style={{ width: `${pourcentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
