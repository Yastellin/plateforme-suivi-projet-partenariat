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
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const actif = valeur === option.cle;

        return (
          <button
            key={option.cle}
            type="button"
            aria-pressed={actif}
            className={
              actif
                ? 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3 py-[5px] text-[12.5px] font-semibold text-white transition-colors'
                : 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] px-3 py-[5px] text-[12.5px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]'
            }
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
