import { useRef } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useConventions } from '@/features/conventions/api/useConventions';
import {
  libelleEcheance,
  selectionnerConventionsPrioritaires,
} from '@/features/tableau-de-bord/lib/conventions-prioritaires';
import { formaterDate } from '@/lib/format';
import { LIBELLES_STATUT_CONVENTION } from '@/lib/status-mappings';

export function ConventionsPrioritaires() {
  const conteneur = useRef<HTMLDivElement>(null);
  const { data, isLoading, dataUpdatedAt } = useConventions({
    page: 1,
    limit: 100,
  });
  const conventions = selectionnerConventionsPrioritaires(
    data?.data ?? [],
    dataUpdatedAt,
  );

  const defiler = (direction: -1 | 1) => {
    conteneur.current?.scrollBy({
      left: direction * 320,
      behavior: 'smooth',
    });
  };

  if (isLoading && !data) {
    return (
      <div className="flex gap-3 overflow-hidden p-4">
        {[0, 1, 2].map((cle) => (
          <Skeleton key={cle} className="h-44 min-w-[270px] flex-1" />
        ))}
      </div>
    );
  }

  if (conventions.length === 0) {
    return (
      <EmptyState
        icone={CalendarClock}
        titre="Aucune convention prioritaire"
        description="Les conventions échues, suspendues, en attente de signature ou proches de leur échéance apparaîtront ici."
      />
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[18px] py-2.5">
        <p className="text-xs text-[var(--color-text-secondary)]">
          {conventions.length} priorité{conventions.length > 1 ? 's' : ''} · défilement horizontal
        </p>
        <div className="flex items-center gap-1" aria-label="Parcourir les conventions prioritaires">
          <button
            type="button"
            onClick={() => defiler(-1)}
            aria-label="Voir les conventions précédentes"
            className="rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => defiler(1)}
            aria-label="Voir les conventions suivantes"
            className="rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={conteneur}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain p-4"
      >
        {conventions.map((convention) => {
          const statut = LIBELLES_STATUT_CONVENTION[convention.statut];
          return (
            <article
              key={convention.id}
              className="flex min-h-44 w-[280px] shrink-0 snap-start flex-col rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="font-mono text-[11.5px] font-semibold text-[var(--color-text-secondary)]">
                  {convention.reference}
                </span>
                <StatusBadge
                  libelle={statut.libelle}
                  tonalite={statut.tonalite}
                />
              </div>

              <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                {convention.titre}
              </h3>

              <div className="mt-3 text-xs text-[var(--color-text-secondary)]">
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {libelleEcheance(convention, dataUpdatedAt)}
                </p>
                {convention.date_fin ? (
                  <p className="mt-1">{formaterDate(convention.date_fin)}</p>
                ) : null}
              </div>

              <Link
                to={`/presidence/conventions/${convention.id}`}
                className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold text-[var(--color-brand)] hover:underline"
              >
                Ouvrir la convention
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
