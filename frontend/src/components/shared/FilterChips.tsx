// src/components/shared/FilterChips.tsx

interface FilterChipOptions {
  cle: string;
  libelle: string;
  compteur?: number;
}

interface FilterChipsProps {
  options: FilterChipOptions[];
  valeur: string;
  onChange: (valeur: string) => void;
}

export function FilterChips({ options, valeur, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.cle}
          type="button"
          className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)] px-3 py-1.5 text-[11px] transition-colors ${valeur === option.cle ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]' : ''}`}
          onClick={() => onChange(option.cle)}
        >
          {option.libelle}{option.compteur && (
            <span className="ml-1 text-[10px] bg-[var(--color-surface)] rounded bg-[var(--color-border)] px-1.5 py-0.5">
              {option.compteur}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}