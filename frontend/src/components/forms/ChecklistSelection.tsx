// src/components/forms/ChecklistSelection.tsx

import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface OptionSelection {
  id: string;
  libelle: string;
  detail?: string;
  /** Élément affiché à gauche de la ligne (ex. logo de l'établissement). */
  vignette?: ReactNode;
}

interface RechercheSelection {
  valeur: string;
  onChange: (valeur: string) => void;
  placeholder: string;
}

interface ChecklistSelectionProps {
  options: OptionSelection[];
  selection: string[];
  libelles: Record<string, string>;
  onChange: (ids: string[], libellesAjoutes: Record<string, string>) => void;
  chargement: boolean;
  messageVide: string;
  recherche?: RechercheSelection;
  erreur?: string;
}

export function ChecklistSelection({
  options,
  selection,
  libelles,
  onChange,
  chargement,
  messageVide,
  recherche,
  erreur,
}: ChecklistSelectionProps) {
  function basculer(option: OptionSelection) {
    if (selection.includes(option.id)) {
      onChange(
        selection.filter((id) => id !== option.id),
        {},
      );
      return;
    }
    onChange([...selection, option.id], { [option.id]: option.libelle });
  }

  function retirer(id: string) {
    onChange(
      selection.filter((valeur) => valeur !== id),
      {},
    );
  }

  return (
    <div>
      {recherche ? (
        <div className="mb-3 flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-secondary)]" />
          <input
            type="search"
            value={recherche.valeur}
            onChange={(e) => recherche.onChange(e.target.value)}
            placeholder={recherche.placeholder}
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </div>
      ) : null}

      {selection.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selection.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-active-zone)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-brand-deep)]"
            >
              {libelles[id] ?? id}
              <button
                type="button"
                onClick={() => retirer(id)}
                aria-label={`Retirer ${libelles[id] ?? id}`}
                className="hover:text-[var(--status-expire-fg)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={
          erreur
            ? 'max-h-64 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--status-expire-fg)]'
            : 'max-h-64 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]'
        }
      >
        {chargement ? (
          <div className="flex flex-col gap-2 p-3">
            {[0, 1, 2, 3].map((cle) => (
              <Skeleton key={cle} className="h-9 w-full" />
            ))}
          </div>
        ) : options.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-[var(--color-text-secondary)]">{messageVide}</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {options.map((option) => (
              <li key={option.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-page-bg)]">
                  <input
                    type="checkbox"
                    checked={selection.includes(option.id)}
                    onChange={() => basculer(option)}
                    className="h-[15px] w-[15px] accent-[var(--color-brand)]"
                  />
                  {option.vignette ?? null}
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold">{option.libelle}</span>
                    {option.detail ? (
                      <span className="block text-xs text-[var(--color-text-secondary)]">{option.detail}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {erreur ? (
        <p role="alert" className="mt-1.5 px-0.5 text-[11.5px] font-medium text-[var(--status-expire-fg)]">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}