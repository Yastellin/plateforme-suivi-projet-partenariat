// src/components/shared/RepartitionBars.tsx

export type TonRepartition = 'brand' | 'warning' | 'circuit' | 'error';

export interface LigneRepartition {
  cle: string;
  libelle: string;
  valeur: number;
  ton: TonRepartition;
}

interface RepartitionBarsProps {
  lignes: LigneRepartition[];
}

const COULEURS_TON: Record<TonRepartition, string> = {
  brand: 'var(--color-brand)',
  warning: 'var(--color-brand-moment)',
  circuit: '#3B82F6',
  error: '#B91C1C',
};

export function RepartitionBars({ lignes }: RepartitionBarsProps) {
  const total = lignes.reduce((somme, ligne) => somme + (Number(ligne.valeur) || 0), 0);

  return (
    <div className="flex flex-col gap-[13px]">
      {lignes.map((ligne) => {
        const valeur = Number(ligne.valeur) || 0;
        const part = total > 0 ? Math.round((valeur / total) * 100) : 0;

        return (
          <div key={ligne.cle} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-[5px]">
            <span className="text-[12.5px] font-semibold">{ligne.libelle}</span>
            <span className="font-mono text-[12px] font-bold text-[var(--color-text-secondary)]">
              {valeur} ({part}%)
            </span>
            <div className="col-span-full h-[9px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
              <div
                className="h-full rounded-[var(--radius-sm)]"
                style={{ width: `${part}%`, backgroundColor: COULEURS_TON[ligne.ton] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
