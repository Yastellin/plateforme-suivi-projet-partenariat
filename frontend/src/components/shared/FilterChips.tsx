// src/components/shared/FilterChips.tsx

import type { ReactNode } from 'react';

export interface FiltreChipDefinition {
  cle: string;
  libelle: string;
  compteur?: number;
}

interface FilterChipsProps {
  options: FiltreChipDefinition[];
  valeur: string;
  onChange: (valeur: string) => void;
  className?: string;
}

export function FilterChips({ options, valeur, onChange, className }: FilterChipsProps) {
  return (
    <div className={className ?? 'ml-auto flex flex-wrap gap-1.5'}>
      {options.map((option) => {
        const actif = option.cle === valeur;
        return (
          <button
            key={option.cle}
            type="button"
            onClick={() => onChange(option.cle)}
            aria-pressed={actif}
            className={
              actif
                ? 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3 py-[5px] text-[12.5px] font-semibold text-white'
                : 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-[5px] text-[12.5px] font-semibold text-[var(--color-text-secondary)]'
            }
          >
            {option.libelle}
            {typeof option.compteur === 'number' ? (
              <span className="font-mono text-[11.5px] opacity-80">{option.compteur}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

interface ChipProps {
  actif: boolean;
  onClick: () => void;
  children: ReactNode;
  compteur?: number;
}

export function Chip({ actif, onClick, children, compteur }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={
        actif
          ? 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3 py-[5px] text-[12.5px] font-semibold text-white'
          : 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-[5px] text-[12.5px] font-semibold text-[var(--color-text-secondary)]'
      }
    >
      {children}
      {typeof compteur === 'number' ? (
        <span className="font-mono text-[11.5px] opacity-80">{compteur}</span>
      ) : null}
    </button>
  );
}
