// src/features/tableau-de-bord/components/EcheancierListe.tsx
import { Link } from 'react-router-dom';
import { ExternalLink, CalendarCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { EcheanceProchaine } from '@/types/api';

interface EcheancierListeProps {
  echeances: EcheanceProchaine[] | undefined;
  chargement: boolean;
}

function formaterDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function EcheancierListe({ echeances, chargement }: EcheancierListeProps) {
  if (chargement) {
    return (
      <div className="flex flex-col gap-3 p-5">
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!echeances || echeances.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center">
        <CalendarCheck className="h-12 w-12 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
        <p className="text-[13.5px] font-semibold">Aucune convention à échéance proche</p>
        <p className="text-[12.5px] text-[var(--color-text-secondary)]">
          Les conventions arrivant bientôt à expiration apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Référence
            </th>
            <th className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Objet
            </th>
            <th className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Échéance
            </th>
            <th className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Jours restants
            </th>
            <th className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {echeances.map((echeance) => (
            <tr key={echeance.id} className="hover:bg-[var(--color-page-bg)]">
              <td className="whitespace-nowrap border-b border-[var(--color-border)] px-5 py-3.5 font-mono text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
                {echeance.reference}
              </td>
              <td className="border-b border-[var(--color-border)] px-5 py-3.5 font-semibold">
                {echeance.titre}
              </td>
              <td className="whitespace-nowrap border-b border-[var(--color-border)] px-5 py-3.5 font-mono text-[12.5px]">
                {formaterDate(echeance.date_fin)}
              </td>
              <td className="whitespace-nowrap border-b border-[var(--color-border)] px-5 py-3.5 font-mono text-[12.5px]">
                {echeance.jours_restants} j
              </td>
              <td className="border-b border-[var(--color-border)] px-5 py-3.5 text-right">
                <Link
                  to={`/presidence/conventions/${echeance.id}`}
                  aria-label="Ouvrir la convention"
                  className="inline-flex rounded-md p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}