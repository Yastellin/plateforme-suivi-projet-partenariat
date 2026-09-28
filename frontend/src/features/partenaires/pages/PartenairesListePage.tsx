// src/features/partenaires/pages/PartenairesListePage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Handshake } from 'lucide-react';
import { usePartenaires } from '../api/usePartenaires';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

const LIMITE_PAR_PAGE = 20;

export function PartenairesListePage() {
  const { utilisateur } = useAuth();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');

  const { data, isLoading } = usePartenaires({ page, limit: LIMITE_PAR_PAGE, recherche });

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';
  const peutCreer = role === 'PRESIDENCE' || role === 'ETABLISSEMENT';

  return (
    <div>
      <div className="mb-[26px] flex items-start justify-between gap-5">
        <h1 className="text-[24px] font-bold">Partenaires</h1>
        {peutCreer ? (
          <Link
            to={`${cheminBase}/partenaires-partenariats/partenaires/nouveau`}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouveau partenaire
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un partenaire"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icone={Handshake}
            titre={recherche ? 'Aucun résultat pour cette recherche' : 'Aucun partenaire enregistré'}
            description={
              recherche ? 'Essayez avec un autre terme de recherche.' : 'Les partenaires ajoutés apparaîtront ici.'
            }
            action={
              peutCreer && !recherche ? (
                <Link
                  to={`${cheminBase}/partenaires-partenariats/partenaires/nouveau`}
                  className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau partenaire
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Nom', 'Type', 'Pays', 'Statut'].map((entete) => (
                      <th
                        key={entete}
                        className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((partenaire) => (
                    <tr key={partenaire.id} className="hover:bg-[var(--color-page-bg)]">
                      <td className="border-b border-[var(--color-border)] px-5 py-3.5">
                        <Link
                          to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                          className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                        >
                          {partenaire.nom}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border)] px-5 py-3.5 text-[var(--color-text-secondary)]">
                        {partenaire.type}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-5 py-3.5 text-[var(--color-text-secondary)]">
                        {partenaire.pays}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-5 py-3.5">
                        <StatusBadge
                          libelle={partenaire.statut === 'ACTIF' ? 'Actif' : 'Suspendu'}
                          tonalite={partenaire.statut === 'ACTIF' ? 'actif' : 'attente'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination meta={data.meta} onChangerPage={setPage} />
          </>
        )}
      </section>
    </div>
  );
}