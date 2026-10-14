// src/components/shared/KpiCard.tsx

import { createElement, type ComponentType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TonDeltaKpi = 'neutre' | 'up' | 'warn';

interface KpiCardProps {
  /**
   * Icône de la carte :
   * - soit un élément React (version feature, ex. <Users className="…" />),
   * - soit un composant d'icône Lucide (version develop, ex. Users).
   */
  icone?: ReactNode | ComponentType<{ className?: string }>;
  libelle: string;
  valeur: number | string;
  /** Texte du delta (feature). */
  delta?: string;
  deltaTon?: TonDeltaKpi;
  /** Alias develop de delta / deltaTon. */
  variation?: string;
  variationTon?: TonDeltaKpi;
  critique?: boolean;
  className?: string;
}

const CLASSES_DELTA: Record<TonDeltaKpi, string> = {
  neutre: 'text-[var(--color-text-secondary)]',
  up: 'text-[var(--color-brand)]',
  warn: 'text-[#8A5A00]',
};

function estComposantIcône(icone: ReactNode | ComponentType<{ className?: string }>): icone is ComponentType<{ className?: string }> {
  return typeof icone === 'function' || (typeof icone === 'object' && icone !== null && 'render' in icone);
}

function rendreIcône(icone: ReactNode | ComponentType<{ className?: string }> | undefined): ReactNode {
  if (icone == null) return null;
  if (estComposantIcône(icone)) {
    return createElement(icone, { className: 'h-[14px] w-[14px] shrink-0' });
  }
  return icone;
}

export function KpiCard({
  icone,
  libelle,
  valeur,
  delta,
  deltaTon,
  variation,
  variationTon = 'neutre',
  critique = false,
  className,
}: KpiCardProps) {
  const texteDelta = delta ?? variation;
  const tonDelta: TonDeltaKpi = deltaTon ?? variationTon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px_18px_16px] shadow-[var(--shadow-sm)]',
        critique && 'border-[var(--color-brand-moment)]',
        className,
      )}
    >
      {critique ? <div className="woven-accent absolute inset-x-0 top-0" aria-hidden="true" /> : null}

      <div className="mb-[11px] flex items-center gap-2 text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
        {icone ? (
          <span
            className={cn(
              'inline-flex shrink-0 [&>svg]:h-[14px] [&>svg]:w-[14px]',
              critique ? 'text-[#8A5A00]' : 'text-[var(--color-brand)]',
            )}
          >
            {rendreIcône(icone)}
          </span>
        ) : null}
        <span>{libelle}</span>
      </div>

      <div className="text-[length:var(--fs-kpi)] font-mono font-bold leading-none tracking-[-.022em] text-[var(--color-text-primary)]">
        {valeur}
      </div>

      {texteDelta ? (
        <p className={cn('mt-2.5 text-[12.5px] font-semibold', CLASSES_DELTA[tonDelta])}>{texteDelta}</p>
      ) : null}
    </div>
  );
}
