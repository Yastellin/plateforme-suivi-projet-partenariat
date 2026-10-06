// src/features/partenaires/pages/PartenairesListePage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Handshake } from 'lucide-react';
import { usePartenaires } from '../api/usePartenaires';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

const LIMITE_PAR_PAGE = 20;

export function PartenairesListePage() {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');

  const { data, isLoading } = usePartenaires({ page, limit: LIMITE_PAR_PAGE, recherche });

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';

  return (
    <div>
      <PageHeader
        titre="Partenaires"
        description="Tous les partenaires de la plateforme."
        actions={
          permissions.peutCreer ? (
            <Link
              to={`${cheminBase}/partenaires-partenariats/partenaires/nouveau`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau partenaire
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
          placeholderRecherche="Rechercher un partenaire…"
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
            titre={recherche ? 'Aucun résultat pour cette recherche' : 'Aucun partenaire enregistré'}
            description={
              recherche ? 'Essayez avec un autre terme de recherche.' : 'Les partenaires ajoutés apparaîtront ici.'
            }
            action={
              permissions.peutCreer && !recherche ? (
                <Link
                  to={`${cheminBase}/partenaires-partenariats/partenaires/nouveau`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau partenaire
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
                    {['Nom', 'Type', 'Pays', 'Statut'].map((entete) => (
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
                  {data.data.map((partenaire) => (
                    <tr key={partenaire.id} className="hover:bg-[var(--color-page-bg)]">
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                        <Link
                          to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                          className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                        >
                          {partenaire.nom}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {partenaire.type}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {partenaire.pays}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
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
            {data.meta && <TablePagination meta={data.meta} onChangerPage={setPage} />}
          </PanelBody>
        )}
      </Panel>
    </div>
  );
}
