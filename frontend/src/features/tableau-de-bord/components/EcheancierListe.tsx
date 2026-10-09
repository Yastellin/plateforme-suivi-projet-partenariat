// src/features/tableau-de-bord/components/EcheancierListe.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CalendarCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { FilterChips } from '@/components/shared/FilterChips';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useConventions } from '@/features/conventions/api/useConventions';
import { useEcheancier } from '../api/useEcheancier';
import { cheminTableauDeBord } from '@/router';
import { useAuth } from '@/hooks/useAuth';
import { LIBELLES_STATUT_CONVENTION } from '@/lib/status-mappings';
import { formaterDate } from '@/lib/format';
import type { Convention } from '@/types/api';

const LIMITE = 10;

type FiltreEcheancier = 'toutes' | 'echues' | '30j';

const OPTIONS_FILTRE = [
  { cle: 'toutes', libelle: 'Toutes' },
  { cle: 'echues', libelle: 'Échues' },
  { cle: '30j', libelle: '≤ 30 j' },
];

interface EcheancierListeProps {
  compact?: boolean;
}

export function EcheancierListe({ compact = false }: EcheancierListeProps) {
  const { utilisateur } = useAuth();
  const base = utilisateur ? cheminTableauDeBord(utilisateur.role) : '/presidence';

  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<FiltreEcheancier>('toutes');
  const [page, setPage] = useState(1);
  const rechercheDebouncee = useDebounce(recherche, 300);

  const { data: echeancesBrutes } = useEcheancier();

  const filtresApi = {
    page,
    limit: LIMITE,
    reference: rechercheDebouncee || undefined,
    statut: filtre === 'echues' ? 'EXPIREE' : undefined,
  };
  const { data: conventions, isLoading } = useConventions(filtresApi);

  const echeances = Array.isArray(echeancesBrutes) ? echeancesBrutes : [];

  // Compteurs pour les pastilles
  const compteurToutes = echeances.length;
  const compteurEchues = echeances.filter((e) => e.statut === 'EXPIREE').length;
  const compteur30j = echeances.filter((e) => {
    if (!e.jours_restants) return false;
    return e.jours_restants <= 30;
  }).length;

  const lignes: Convention[] = conventions?.data ?? [];

  if (isLoading && !conventions) {
    return (
      <div className="flex flex-col gap-3 p-[16px_18px]">
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (lignes.length === 0 && echeances.length === 0) {
    return (
      <EmptyState
        icone={CalendarCheck}
        titre="Aucune convention à traiter"
        description="Les conventions arrivant à échéance ou en attente de traitement apparaîtront ici."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <TableToolbar
        valeurRecherche={recherche}
        onRechercheChange={(valeur) => {
          setRecherche(valeur);
          setPage(1);
        }}
        placeholderRecherche="Rechercher une référence…"
        enfants={
          <FilterChips
            options={[
              { ...OPTIONS_FILTRE[0], compteur: compteurToutes },
              { ...OPTIONS_FILTRE[1], compteur: compteurEchues },
              { ...OPTIONS_FILTRE[2], compteur: compteur30j },
            ]}
            valeur={filtre}
            onChange={(valeur) => {
              setFiltre(valeur as FiltreEcheancier);
              setPage(1);
            }}
          />
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">
                Référence
              </th>
              <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">
                Établissement
              </th>
              {!compact && (
                <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">
                  Objet
                </th>
              )}
              <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">
                Échéance
              </th>
              <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">
                État
              </th>
              <th scope="col" className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px]"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((convention) => {
              const info = LIBELLES_STATUT_CONVENTION[convention.statut] ?? LIBELLES_STATUT_CONVENTION.BROUILLON;

              return (
                <tr key={convention.id} className="hover:bg-[var(--color-page-bg)]">
                  <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
                    {convention.reference}
                  </td>
                  <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                    <span className="text-[13.5px] font-semibold">{convention.etablissement_nom ?? '—'}</span>
                  </td>
                  {!compact && (
                    <td className="max-w-[220px] truncate border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                      {convention.titre}
                    </td>
                  )}
                  <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                    {convention.date_fin ? formaterDate(convention.date_fin) : '—'}
                  </td>
                  <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px]">
                    <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                  </td>
                  <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-right">
                    <Link
                      to={`${base}/conventions/${convention.id}`}
                      aria-label="Ouvrir la convention"
                      className="inline-flex rounded-md p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {conventions?.meta && (
        <TablePagination meta={conventions.meta} onChangerPage={setPage} />
      )}
    </div>
  );
}
