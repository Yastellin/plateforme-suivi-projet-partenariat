// src/features/synthese/components/SyntheseTableauEtablissements.tsx
import { Link } from 'react-router-dom';
import { Building2, ChevronRight } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { LigneComparatifEtablissement } from '../lib/synthese';

interface SyntheseTableauEtablissementsProps {
  lignes: LigneComparatifEtablissement[];
  cheminBase: string;
  enChargement?: boolean;
}

function CelluleCompletude({ ligne }: { ligne: LigneComparatifEtablissement }) {
  return (
    <div className="flex min-w-[130px] flex-col gap-1">
      <span className="font-mono text-[12.5px] font-semibold">
        {ligne.elements_narratifs}/{ligne.elements_attendus}
      </span>
      <span className="h-[6px] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
        <span
          className="block h-full rounded-[var(--radius-sm)] bg-[var(--color-brand)]"
          style={{ width: `${ligne.completude}%` }}
        />
      </span>
    </div>
  );
}

const ENTETES = [
  'Établissement',
  'Partenaires',
  'Conventions actives',
  'Conventions expirées',
  'Cotutelles',
  'Projets actifs',
  'Synthèse narrative',
  'Partenaires stratégiques',
  '',
] as const;

/** Tableau de synthèse : une ligne par établissement, lien vers le détail. */
export function SyntheseTableauEtablissements({
  lignes,
  cheminBase,
  enChargement = false,
}: SyntheseTableauEtablissementsProps) {
  if (enChargement) {
    return (
      <div className="flex flex-col gap-3 p-[16px_18px]">
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (lignes.length === 0) {
    return (
      <EmptyState
        icone={Building2}
        titre="Aucun établissement à synthétiser"
        description="Ajoutez des établissements pour générer une synthèse annuelle."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {ENTETES.map((entete, index) => (
              <th
                key={entete || `colonne-${index}`}
                scope="col"
                className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]"
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => (
            <tr key={ligne.etablissement_id} className="hover:bg-[var(--color-page-bg)]">
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                <Link
                  to={`${cheminBase}/synthese/${ligne.etablissement_id}`}
                  className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                >
                  {ligne.etablissement_nom}
                </Link>
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono">
                {ligne.partenaires}
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono">
                {ligne.conventions_actives}
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                <span
                  className={
                    ligne.conventions_expirees > 0
                      ? 'font-mono font-semibold text-[var(--status-expire-fg)]'
                      : 'font-mono'
                  }
                >
                  {ligne.conventions_expirees}
                </span>
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono">
                {ligne.cotutelles}
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono">
                {ligne.projets_actifs}
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                <CelluleCompletude ligne={ligne} />
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono">
                {ligne.partenaires_strategiques}
              </td>
              <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-right">
                <Link
                  to={`${cheminBase}/synthese/${ligne.etablissement_id}`}
                  aria-label={`Consulter la synthèse de ${ligne.etablissement_nom}`}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
                >
                  Consulter
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
