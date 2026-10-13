// src/components/shared/TableToolbar.tsx

import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface TableToolbarProps {
  valeurRecherche: string;
  onRechercheChange: (valeur: string) => void;
  placeholderRecherche: string;
  enfants?: ReactNode;
  action?: ReactNode;
}

export function TableToolbar({
  valeurRecherche,
  onRechercheChange,
  placeholderRecherche,
  enfants,
  action,
}: TableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-[var(--color-border)] px-[18px] py-3">
      <div className="flex h-8 max-w-[300px] flex-1 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2.5">
        <Search className="h-[13px] w-[13px] flex-shrink-0 text-[var(--color-text-secondary)]" />
        <input
          type="search"
          value={valeurRecherche}
          onChange={(e) => onRechercheChange(e.target.value)}
          placeholder={placeholderRecherche}
          className="w-full min-w-0 flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
        />
        {valeurRecherche ? (
          <button
            type="button"
            onClick={() => onRechercheChange('')}
            aria-label="Effacer la recherche"
            className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-brand)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {enfants ? <div className="flex flex-wrap gap-1.5">{enfants}</div> : null}
      {action ? <div className="ml-auto flex flex-shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

interface FiltreChipProps {
  actif: boolean;
  onClick: () => void;
  enfants: ReactNode;
  nombre?: number;
}

export function FiltreChip({ actif, onClick, enfants, nombre }: FiltreChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        actif
          ? 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3 py-[5px] text-[12.5px] font-semibold text-white'
          : 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-[5px] text-[12.5px] font-semibold text-[var(--color-text-secondary)]'
      }
    >
      {enfants}
      {typeof nombre === 'number' ? (
        <span className="font-mono text-[11.5px] opacity-80">{nombre}</span>
      ) : null}
    </button>
  );
}