// src/features/synthese/components/SyntheseAnneeSelecteur.tsx
import { useMemo } from 'react';
import { anneesSelectionnables } from '../lib/synthese';

interface SyntheseAnneeSelecteurProps {
  annee: number;
  onAnneeChange: (annee: number) => void;
  libelle?: string;
  id?: string;
}

/** Sélecteur d'année (année courante, cinq années passées, année suivante). */
export function SyntheseAnneeSelecteur({
  annee,
  onAnneeChange,
  libelle = 'Année',
  id = 'synthese-annee',
}: SyntheseAnneeSelecteurProps) {
  const annees = useMemo(() => {
    const liste = anneesSelectionnables();
    return liste.includes(annee) ? liste : [annee, ...liste];
  }, [annee]);

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="text-[12.5px] font-semibold text-[var(--color-text-secondary)]"
      >
        {libelle}
      </label>
      <select
        id={id}
        value={annee}
        onChange={(evenement) => onAnneeChange(Number(evenement.target.value))}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 font-mono text-[13px] font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
      >
        {annees.map((valeur) => (
          <option key={valeur} value={valeur}>
            {valeur}
          </option>
        ))}
      </select>
    </div>
  );
}
