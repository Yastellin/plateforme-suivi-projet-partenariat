// src/components/shared/KpiCard.tsx

import { cn } from '@/lib/utils';

interface KpiCardProps {
  icone?: React.ReactNode;
  libelle: string;
  valeur: number | string;
  critique?: boolean;
  className?: string;
}

export function KpiCard({ icone, libelle, valeur, critique = false, className }: KpiCardProps) {
  const isNumber = typeof valeur === 'number';
  const valDisplay = isNumber ? `${valeur}` : String(valeur);

  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[16px_18px] shadow-[var(--shadow-sm)]',
        critique && 'border-red-500/20',
        className,
      )}
    >
      {icone ? (
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">{icone}</div>
          <div className="flex-1">
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{libelle}</h3>
            <p className="text-[14px] font-mono font-bold text-[var(--color-brand)]">{valDisplay}</p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{libelle}</h3>
          <p className="text-[14px] font-mono font-bold text-[var(--color-brand)]">{valDisplay}</p>
        </div>
      )}

      {critique && (
        <p className="mt-2 text-[10px] text-red-500">
          Critique
        </p>
      )}
    </div>
  );
}