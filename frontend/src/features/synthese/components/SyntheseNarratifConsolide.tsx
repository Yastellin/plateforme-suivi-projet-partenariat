// src/features/synthese/components/SyntheseNarratifConsolide.tsx
import { Link } from 'react-router-dom';
import { FileText, PencilLine } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { LogoMedia } from '@/components/shared/ImageMedia';
import { Skeleton } from '@/components/ui/skeleton';
import { libelleTypeItem } from '../lib/synthese';
import type { SyntheseEtablissement, SyntheseItem } from '@/types/api';

interface SyntheseNarratifConsolideProps {
  /** Items renvoyés par GET /synthese/items (filtres inclus). */
  items: SyntheseItem[];
  /** Synthèses de l'année : utilisées pour nommer les établissements. */
  etablissements: SyntheseEtablissement[];
  cheminBase: string;
  /** Affiche le lien « Compléter » (Présidence). */
  peutGerer?: boolean;
  enChargement?: boolean;
}

/**
 * Vue consolidée des éléments narratifs : les items de l'année sont regroupés
 * par établissement, dans l'ordre du comparatif.
 */
export function SyntheseNarratifConsolide({
  items,
  etablissements,
  cheminBase,
  peutGerer = false,
  enChargement = false,
}: SyntheseNarratifConsolideProps) {
  if (enChargement) {
    return (
      <div className="flex flex-col gap-3 p-[16px_18px]">
        {[0, 1, 2].map((cle) => (
          <Skeleton key={cle} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const groupes = etablissements
    .map((etablissement) => ({
      etablissement,
      items: items.filter((item) => item.etablissement_id === etablissement.etablissement_id),
    }))
    .filter((groupe) => groupe.items.length > 0);

  const itemsOrphelins = items.filter(
    (item) => !etablissements.some((etablissement) => etablissement.etablissement_id === item.etablissement_id),
  );

  if (groupes.length === 0 && itemsOrphelins.length === 0) {
    return (
      <EmptyState
        icone={FileText}
        titre="Aucun élément narratif"
        description="Aucun élément narratif ne correspond aux filtres sélectionnés pour cette année."
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {groupes.map(({ etablissement, items: itemsEtablissement }) => (
        <article key={etablissement.etablissement_id} className="flex flex-col gap-2 px-[18px] py-[16px]">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <Link
              to={`${cheminBase}/synthese/${etablissement.etablissement_id}`}
              className="flex items-center gap-2 text-[13.5px] font-bold hover:text-[var(--color-brand)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <LogoMedia
                src={etablissement.etablissement_logo_url}
                nom={etablissement.etablissement_nom}
                className="h-7 w-7 shrink-0 rounded-md border border-[var(--color-border)] bg-white object-contain p-0.5 text-[9px]"
                loading="lazy"
              />
              {etablissement.etablissement_nom}
            </Link>
            <span className="font-mono text-[11.5px] font-semibold text-[var(--color-text-secondary)]">
              {itemsEtablissement.length} élément{itemsEtablissement.length > 1 ? 's' : ''}
            </span>
            {peutGerer ? (
              <Link
                to={`${cheminBase}/synthese/${etablissement.etablissement_id}`}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
              >
                <PencilLine className="h-3 w-3" />
                Compléter
              </Link>
            ) : null}
          </header>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-3">
            {itemsEtablissement.map((item) => (
              <div key={item.id} className="min-w-0">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  {libelleTypeItem(item.type)}
                </dt>
                <dd className="mt-0.5 whitespace-pre-line text-[12.5px] text-[var(--color-text-primary)]">
                  {item.valeur}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}

      {itemsOrphelins.length > 0 ? (
        <article className="flex flex-col gap-2 px-[18px] py-[16px]">
          <h4 className="text-[13.5px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Autres établissements
          </h4>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-3">
            {itemsOrphelins.map((item) => (
              <div key={item.id} className="min-w-0">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  {libelleTypeItem(item.type)}
                </dt>
                <dd className="mt-0.5 whitespace-pre-line text-[12.5px]">{item.valeur}</dd>
              </div>
            ))}
          </dl>
        </article>
      ) : null}
    </div>
  );
}
