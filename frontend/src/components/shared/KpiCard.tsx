// src/components/shared/KpiCard.tsx

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TonDeltaKpi = 'neutre' | 'up' | 'warn';

interface KpiCardProps {
  icone?: ReactNode;
  libelle: string;
  valeur: number | string;
  delta?: string;
  deltaTon?: TonDeltaKpi;
  critique?: boolean;
  className?: string;
}

const CLASSES_DELTA: Record<TonDeltaKpi, string> = {
  neutre: 'text-[var(--color-text-secondary)]',
  up: 'text-[var(--color-brand)]',
  warn: 'text-[#8A5A00]',
};

export function KpiCard({
  icone,
  libelle,
  valeur,
  delta,
  deltaTon = 'neutre',
  critique = false,
  className,
}: KpiCardProps) {
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
            {icone}
          </span>
        ) : null}
        <span>{libelle}</span>
      </div>

      <div className="text-[length:var(--fs-kpi)] font-mono font-bold leading-none tracking-[-.022em] text-[var(--color-text-primary)]">
        {valeur}
      </div>

      {delta ? (
        <p className={cn('mt-2.5 text-[12.5px] font-semibold', CLASSES_DELTA[deltaTon])}>{delta}</p>
      ) : null}
    </div>
  );
}
