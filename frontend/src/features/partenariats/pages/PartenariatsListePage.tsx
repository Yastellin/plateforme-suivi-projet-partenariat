// src/features/partenariats/pages/PartenariatsListePage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Plus } from 'lucide-react';
import { usePartenariats } from '../api/usePartenariats';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { formaterDate } from '@/lib/format';
import { LIBELLES_DOMAINE_PARTENARIAT, LIBELLES_STATUT_PARTENARIAT } from '@/lib/status-mappings';

const LIMITE_PAR_PAGE = 20;
const ENTETES = ['Intitulé', 'Domaine', 'Période', 'Établissements', 'Statut'];

export function PartenariatsListePage() {
  const { utilisateur } = useAuth();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');

  const { data, isLoading } = usePartenariats({ page, limit: LIMITE_PAR_PAGE, recherche });

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';
  const peutCreer = role === 'PRESIDENCE' || role === 'ETABLISSEMENT';
  const cheminCreation = `${cheminBase}/partenaires-partenariats/partenariats/nouveau`;

  const boutonCreation = (
    <Link
      to={cheminCreation}
      className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
    >
      <Plus className="h-3.5 w-3.5" />
      Nouveau partenariat
    </Link>
  );

  return (
    <div>
      <div className="mb-[26px] flex items-start justify-between gap-5">
        <h1 className="text-[24px] font-bold">Partenariats</h1>
        {peutCreer ? boutonCreation : null}
      </div>

      <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un partenariat"
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
            titre={recherche ? 'Aucun résultat pour cette recherche' : 'Aucun partenariat enregistré'}
            description={
              recherche ? 'Essayez avec un autre terme de recherche.' : 'Les partenariats ajoutés apparaîtront ici.'
            }
            action={peutCreer && !recherche ? boutonCreation : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {ENTETES.map((entete) => (
                      <th
                        key={entete}
                        className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((partenariat) => {
                    const info = LIBELLES_STATUT_PARTENARIAT[partenariat.statut];
                    const partenaires = partenariat.partenaires.map((p) => p.nom).join(', ');
                    const etablissements = partenariat.etablissements.map((e) => e.sigle ?? e.nom).join(', ');

                    return (
                      <tr key={partenariat.id} className="hover:bg-[var(--color-page-bg)]">
                        <td className="border-b border-[var(--color-border)] px-5 py-3.5">
                          <Link
                            to={`${cheminBase}/partenaires-partenariats/partenariats/${partenariat.id}`}
                            className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                          >
                            {partenariat.intitule}
                          </Link>
                          {partenaires ? (
                            <div className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{partenaires}</div>
                          ) : null}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-5 py-3.5 text-[var(--color-text-secondary)]">
                          {LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-5 py-3.5 font-mono text-[12.5px]">
                          {formaterDate(partenariat.date_debut)}
                          {partenariat.date_fin ? ` au ${formaterDate(partenariat.date_fin)}` : ''}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-5 py-3.5 text-[var(--color-text-secondary)]">
                          {etablissements || 'Aucun'}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-5 py-3.5">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                        </td>
                      </tr>
                    );
                  })}
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