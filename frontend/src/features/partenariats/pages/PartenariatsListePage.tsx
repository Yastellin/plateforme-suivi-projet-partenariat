// src/features/partenariats/pages/PartenariatsListePage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Plus } from 'lucide-react';
import { usePartenariats } from '../api/usePartenariats';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { formaterDate } from '@/lib/format';
import { LIBELLES_DOMAINE_PARTENARIAT, LIBELLES_STATUT_PARTENARIAT } from '@/lib/status-mappings';

const LIMITE_PAR_PAGE = 20;

export function PartenariatsListePage() {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');

  const { data, isLoading } = usePartenariats({ page, limit: LIMITE_PAR_PAGE, recherche });

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';
  const cheminCreation = `${cheminBase}/partenaires-partenariats/partenariats/nouveau`;

  return (
    <div>
      <PageHeader
        titre="Partenariats"
        description="Tous les partenariats de la plateforme."
        actions={
          permissions.peutCreer ? (
            <Link
              to={cheminCreation}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau partenariat
            </Link>
          ) : null
        }
      />

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un partenariat…"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
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
            action={
              permissions.peutCreer && !recherche ? (
                <Link
                  to={cheminCreation}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau partenariat
                </Link>
              ) : undefined
            }
          />
        ) : (
          <PanelBody>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Intitulé', 'Domaine', 'Période', 'Établissements', 'Statut'].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]"
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
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
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
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                          {LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                          {formaterDate(partenariat.date_debut)}
                          {partenariat.date_fin ? ` au ${formaterDate(partenariat.date_fin)}` : ''}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                          {etablissements || 'Aucun'}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data.meta && <TablePagination meta={data.meta} onChangerPage={setPage} />}
          </PanelBody>
        )}
      </Panel>
    </div>
  );
}
