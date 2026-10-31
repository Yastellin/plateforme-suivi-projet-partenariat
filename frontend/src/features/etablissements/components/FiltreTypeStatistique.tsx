// src/features/etablissements/components/FiltreTypeStatistique.tsx

import { cn } from "@/lib/utils";

export type TypeStatistique = "tous" | "projets" | "partenaires" | "partenariats";

const OPTIONS: { valeur: TypeStatistique; libelle: string }[] = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "projets", libelle: "Projets" },
  { valeur: "partenaires", libelle: "Partenaires" },
  { valeur: "partenariats", libelle: "Partenariats" },
];

interface FiltreTypeStatistiqueProps {
  valeur: TypeStatistique;
  onChange: (valeur: TypeStatistique) => void;
}

// Segmented control : n'affiche que les projets, les partenaires, les partenariats, ou tout.
export function FiltreTypeStatistique({ valeur, onChange }: FiltreTypeStatistiqueProps) {
  return (
    <div
      role="group"
      aria-label="Filtrer les statistiques"
      className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.valeur}
          type="button"
          aria-pressed={valeur === option.valeur}
          onClick={() => onChange(option.valeur)}
          className={cn(
            "rounded-[calc(var(--radius-sm)-2px)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
            valeur === option.valeur
              ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-[var(--shadow-sm)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
          )}
        >
          {option.libelle}
        </button>
      ))}
    </div>
  );
}
