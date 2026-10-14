// src/features/synthese/components/SyntheseListePartenairesStrategiques.tsx
import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { SyntheseEtablissement, SynthesePartenaireStrategique } from '@/types/api';

interface SyntheseListePartenairesStrategiquesProps {
  /** Désignations renvoyées par GET /synthese/partenaires-strategiques. */
  partenaires: SynthesePartenaireStrategique[];
  etablissements: SyntheseEtablissement[];
  cheminBase: string;
  enChargement?: boolean;
}

/** Vue consolidée des partenaires stratégiques désignés pour l'année. */
export function SyntheseListePartenairesStrategiques({
  partenaires,
  etablissements,
  cheminBase,
  enChargement = false,
}: SyntheseListePartenairesStrategiquesProps) {
  if (enChargement) {
    return (
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((cle) => (
          <Skeleton key={cle} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (partenaires.length === 0) {
    return (
      <EmptyState
        icone={Handshake}
        titre="Aucun partenaire stratégique"
        description="Aucune désignation ne correspond au filtre sélectionné pour cette année."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {partenaires.map((partenaire) => {
        const etablissement = etablissements.find((element) =>
          element.partenaires_strategiques.some((designation) => designation.id === partenaire.id),
        );

        return (
          <li
            key={partenaire.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Handshake className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-brand)]" />
              <span className="truncate text-[13px] font-semibold">
                {partenaire.partenaire_nom ?? 'Partenaire'}
              </span>
            </span>
            {etablissement ? (
              <Link
                to={`${cheminBase}/synthese/${etablissement.etablissement_id}`}
                className="text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)]"
              >
                {etablissement.etablissement_nom}
              </Link>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
