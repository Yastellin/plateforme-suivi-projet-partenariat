// src/components/shared/FilterChips.tsx

import type { ReactNode } from 'react';

export interface FiltreChipDefinition {
  cle: string;
  libelle: string;
  compteur?: number;
}

/** @deprecated Alias conservé pour compatibilité — utiliser FiltreChipDefinition. */
export type FilterChipOptions = FiltreChipDefinition;

interface FilterChipsProps {
  options: FiltreChipDefinition[];
  valeur: string;
  onChange: (valeur: string) => void;
  className?: string;
}

const CLASSES_BOUTON_ACTIF =
  'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3 py-[5px] text-[12.5px] font-semibold text-white transition-colors';
const CLASSES_BOUTON_INACTIF =
  'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] px-3 py-[5px] text-[12.5px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]';

export function FilterChips({ options, valeur, onChange, className }: FilterChipsProps) {
  return (
    <div className={className ?? 'ml-auto flex flex-wrap gap-1.5'}>
      {options.map((option) => {
        const actif = valeur === option.cle;

        return (
          <button
            key={option.cle}
            type="button"
            aria-pressed={actif}
            className={actif ? CLASSES_BOUTON_ACTIF : CLASSES_BOUTON_INACTIF}
            onClick={() => onChange(option.cle)}
          >
            {option.libelle}
            {typeof option.compteur === 'number' ? (
              <span className="font-mono text-[11.5px] opacity-90">{option.compteur}</span>
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
      className={actif ? CLASSES_BOUTON_ACTIF : CLASSES_BOUTON_INACTIF}
    >
      {children}
      {typeof compteur === 'number' ? (
        <span className="font-mono text-[11.5px] opacity-90">{compteur}</span>
      ) : null}
    </button>
  );
}
