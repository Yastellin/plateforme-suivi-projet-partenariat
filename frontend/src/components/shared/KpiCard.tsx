// src/components/shared/KpiCard.tsx

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icone: LucideIcon;
  libelle: string;
  valeur: number | string;
  variation?: string;
  variationTon?: 'up' | 'warn' | 'neutre';
  critique?: boolean;
}

export function KpiCard({ icone: Icone, libelle, valeur, variation, variationTon = 'neutre', critique }: KpiCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] p-[18px_18px_16px] shadow-[var(--shadow-sm)]',
        critique
          ? 'border-[var(--color-brand-moment)]'
          : 'border-[var(--color-border)]',
      )}
    >
      {critique ? <div className="woven-accent absolute inset-x-0 top-0" /> : null}

      <div className="mb-[11px] flex items-center gap-2 text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
        <Icone
          className={cn(
            'h-3.5 w-3.5',
            critique ? 'text-[var(--status-attente-fg)]' : 'text-[var(--color-brand)]',
          )}
        />
        {libelle}
      </div>

      <div
        className="text-[30px] font-bold leading-none tracking-[-.022em]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {valeur}
      </div>

      {variation ? (
        <p
          className={cn(
            'mt-2.5 text-[12.5px] font-semibold',
            variationTon === 'up' && 'text-[var(--color-brand)]',
            variationTon === 'warn' && 'text-[var(--status-attente-fg)]',
            variationTon === 'neutre' && 'text-[var(--color-text-secondary)]',
          )}
        >
          {variation}
        </p>
      ) : null}
    </div>
  );
}

interface KpiGridProps {
  children: React.ReactNode;
}

export function KpiGrid({ children }: KpiGridProps) {
  return (
    <div className="mb-[22px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
