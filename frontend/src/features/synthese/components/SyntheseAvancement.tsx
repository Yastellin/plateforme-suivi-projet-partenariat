// src/features/synthese/components/SyntheseAvancement.tsx
import { Skeleton } from '@/components/ui/skeleton';
import type { TotauxSynthese } from '../lib/synthese';

interface SyntheseAvancementProps {
  totaux: TotauxSynthese;
  nombreEtablissements: number;
  enChargement?: boolean;
}

/** Avancement de la campagne de synthèse (complétude narrative). */
export function SyntheseAvancement({
  totaux,
  nombreEtablissements,
  enChargement = false,
}: SyntheseAvancementProps) {
  if (enChargement) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-end justify-between gap-2">
          <span className="font-mono text-[var(--fs-kpi)] font-bold leading-none">
            {totaux.taux_completude}%
          </span>
          <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
            {totaux.elements_narratifs}/{totaux.elements_attendus} éléments narratifs
          </span>
        </div>
        <div className="mt-2.5 h-[9px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
          <div
            className="h-full rounded-[var(--radius-sm)] bg-[var(--color-brand)]"
            style={{ width: `${totaux.taux_completude}%` }}
          />
        </div>
      </div>

      <dl className="flex flex-col gap-2.5 text-[12.5px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--color-text-secondary)]">Établissements complets (3 éléments sur 3)</dt>
          <dd className="font-mono font-semibold">
            {totaux.etablissements_complets}/{nombreEtablissements}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--color-text-secondary)]">Partenaires stratégiques désignés</dt>
          <dd className="font-mono font-semibold">{totaux.partenaires_strategiques}</dd>
        </div>
      </dl>
    </div>
  );
}
