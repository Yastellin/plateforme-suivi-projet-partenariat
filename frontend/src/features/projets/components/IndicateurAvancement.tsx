// src/features/projets/components/IndicateurAvancement.tsx

interface IndicateurAvancementProps {
  pourcentage: number;
}

export function IndicateurAvancement({ pourcentage }: IndicateurAvancementProps) {
  const valeur = Math.min(Math.max(pourcentage, 0), 100);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
        <span className="font-semibold text-[var(--color-text-secondary)]">Avancement</span>
        <span className="font-mono font-bold">{valeur}%</span>
      </div>
      <div className="h-[9px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
        <div className="h-full rounded-[var(--radius-sm)] bg-[var(--color-brand)]" style={{ width: `${valeur}%` }} />
      </div>
    </div>
  );
}