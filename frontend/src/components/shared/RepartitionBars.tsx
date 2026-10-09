// src/components/shared/RepartitionBars.tsx

import { cn } from '@/lib/utils';

type TonRepartition = 'brand' | 'warning' | 'circuit' | 'error';

export interface LigneRepartition {
  cle: string;
  libelle: string;
  valeur: number;
  ton: TonRepartition;
}

interface RepartitionBarsProps {
  lignes: LigneRepartition[];
}

export function RepartitionBars({ lignes }: RepartitionBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      {lignes.map((ligne) => (
        <div
          key={ligne.cle}
          className={cn(
            'flex items-center gap-2',
            'rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px]',
            `text-[var(--color-text-secondary)]`,
            `bg-[var(--color-surface)]`,
            `.${ligne.ton}-bg:${getTonBackground(ligne.ton)}`
          )}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTonColor(ligne.ton) }} />
          <span>{ligne.libelle}</span>
          <span className="ml-auto text-[var(--color-text-secondary)]">{ligne.valeur}</span>
        </div>
      ))}
    </div>
  );
}

function getTonColor(ton: TonRepartition) {
  const couleurs: Record<TonRepartition, string> = {
    brand: 'var(--color-brand)',
    warning: 'var(--color-warning)',
    circuit: 'var(--status-actif-bg)',
    error: 'var(--status-expire-bg)',
  };
  return couleurs[ton];
}

function getTonBackground(ton: TonRepartition) {
  const backgrounds: Record<TonRepartition, string> = {
    brand: 'var(--color-brand)',
    warning: 'var(--color-warning)',
    circuit: 'var(--status-actif-bg)',
    error: 'var(--status-expire-bg)',
  };
  return backgrounds[ton];
}