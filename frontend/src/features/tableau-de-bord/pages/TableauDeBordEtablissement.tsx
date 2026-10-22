// src/features/tableau-de-bord/pages/TableauDeBordEtablissement.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, FolderKanban, FileStack, ClockAlert, Plus, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTableauDeBord } from '../api/useTableauDeBord';
import { useProjets } from '@/features/projets/api/useProjets';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiGrid } from '@/components/shared/KpiGrid';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader } from '@/components/shared/Panel';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { FilterChips } from '@/components/shared/FilterChips';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusStrip } from '@/components/shared/StatusStrip';
import { RepartitionBars, type LigneRepartition } from '@/components/shared/RepartitionBars';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { LIBELLES_STATUT_PROJET } from '@/lib/status-mappings';
import { formaterDate } from '@/lib/format';
import type { StatutProjet } from '@/types/api';

const LIMITE = 10;

type FiltreProjet = 'tous' | 'EN_COURS' | 'EN_ATTENTE' | 'BROUILLON' | 'retard';

const OPTIONS_FILTRE = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'EN_COURS', libelle: 'En cours' },
  { cle: 'EN_ATTENTE', libelle: 'En attente' },
  { cle: 'BROUILLON', libelle: 'Brouillons' },
  { cle: 'retard', libelle: 'En retard' },
];

export function TableauDeBordEtablissement() {
  const { utilisateur } = useAuth();
  const { data: compteurs, isLoading: chargementCompteurs } = useTableauDeBord();

  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<FiltreProjet>('tous');
  const [page, setPage] = useState(1);
  const rechercheDebouncee = useDebounce(recherche, 300);

  const { data: projets, isLoading: chargementProjets } = useProjets({
    page,
    limit: LIMITE,
    recherche: rechercheDebouncee || undefined,
  });

  const projetsAffiches = (projets?.data ?? []).filter((projet) => {
    if (filtre === 'tous') return true;
    if (filtre === 'retard') return projet.en_retard === true;
    return projet.statut === filtre;
  });

  const repartition = (compteurs?.projets_par_statut ?? {}) as Partial<Record<StatutProjet, number>>;
  const projetsEnRetard = compteurs
    ? Object.entries(repartition)
        .filter(([statut]) => statut === 'EXPIRE')
        .reduce((somme, [, valeur]) => somme + valeur, 0)
    : 0;

  const lignesRepartition: LigneRepartition[] = compteurs
    ? (Object.entries(compteurs.projets_par_statut ?? {}) as [StatutProjet, number][])
        .filter(([, valeur]) => valeur > 0)
        .map(([statut, valeur]) => {
          const info = LIBELLES_STATUT_PROJET[statut];
          const ton: LigneRepartition['ton'] =
            statut === 'EN_COURS' ? 'brand' :
            statut === 'EN_ATTENTE' ? 'warning' :
            statut === 'EXPIRE' ? 'error' : 'brand';
          return { cle: statut, libelle: info.libelle, valeur, ton };
        })
    : [];

  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        description={utilisateur?.etablissement_nom ?? undefined}
        actions={
          <div className="flex gap-2">
            <Link
              to="/etablissement/partenaires-partenariats/partenaires/nouveau"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau partenaire
            </Link>
            <Link
              to="/etablissement/partenaires-partenariats/partenariats/nouveau"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau partenariat
            </Link>
          </div>
        }
      />

      <KpiGrid>
        {chargementCompteurs || !compteurs ? (
          <>
            <Skeleton className="h-[120px] rounded-[var(--radius)]" />
            <Skeleton className="h-[120px] rounded-[var(--radius)]" />
            <Skeleton className="h-[120px] rounded-[var(--radius)]" />
            <Skeleton className="h-[120px] rounded-[var(--radius)]" />
          </>
        ) : (
          <>
            <KpiCard
              icone={<Handshake className="h-4 w-4" />}
              libelle="Mes partenaires"
              valeur={compteurs.partenaires_actifs ?? compteurs.partenaires ?? 0}
            />
            <KpiCard
              icone={<FolderKanban className="h-4 w-4" />}
              libelle="Mes projets en cours"
              valeur={compteurs.projets_en_cours ?? compteurs.projets ?? 0}
            />
            <KpiCard
              icone={<FileStack className="h-4 w-4" />}
              libelle="Mes partenariats"
              valeur={compteurs.partenariats ?? 0}
            />
            <KpiCard
              icone={<ClockAlert className="h-4 w-4" />}
              libelle="Projets en retard"
              valeur={projetsEnRetard}
              critique
            />
          </>
        )}
      </KpiGrid>

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            titre="Mes projets à suivre"
            action={
              <Link
                to="/etablissement/projets"
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                Tout voir
              </Link>
            }
          />

          <TableToolbar
            valeurRecherche={recherche}
            onRechercheChange={(valeur) => {
              setRecherche(valeur);
              setPage(1);
            }}
            placeholderRecherche="Rechercher un projet…"
            enfants={
              <FilterChips
                options={OPTIONS_FILTRE}
                valeur={filtre}
                onChange={(valeur) => {
                  setFiltre(valeur as FiltreProjet);
                  setPage(1);
                }}
              />
            }
          />

          {chargementProjets ? (
            <div className="flex flex-col gap-3 p-[16px_18px]">
              {[0, 1, 2, 3].map((cle) => (
                <Skeleton key={cle} className="h-12 w-full" />
              ))}
            </div>
          ) : projetsAffiches.length === 0 ? (
            <EmptyState
              icone={FolderKanban}
              titre="Aucun projet"
              description="Aucun projet ne correspond à votre recherche."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Nom</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Type</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Échéance</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Avancement</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">État</th>
                    <th scope="col" className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px]"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {projetsAffiches.map((projet) => {
                    const info = LIBELLES_STATUT_PROJET[projet.statut] ?? LIBELLES_STATUT_PROJET.BROUILLON;

                    return (
                      <tr key={projet.id} className="hover:bg-[var(--color-page-bg)]">
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <span className="text-[13.5px] font-semibold">{projet.nom}</span>
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                          {projet.type}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                          {formaterDate(projet.date_fin_prevue)}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                          {projet.avancement}%
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-right">
                          <Link
                            to={`/etablissement/projets/${projet.id}`}
                            aria-label="Ouvrir le projet"
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
          )}

          {projets?.meta && <TablePagination meta={projets.meta} onChangerPage={setPage} />}
        </Panel>

        <Panel>
          <PanelHeader titre="Répartition de mes projets" sousTitre="Par statut" />
          <div className="p-[16px_18px]">
            {lignesRepartition.length === 0 ? (
              <EmptyState
                icone={FolderKanban}
                titre="Aucun projet"
                description="La répartition apparaîtra dès qu'il y aura des projets."
              />
            ) : (
              <RepartitionBars lignes={lignesRepartition} />
            )}
          </div>
        </Panel>
      </div>

      {!chargementCompteurs && compteurs ? (
        <StatusStrip
          items={[
            {
              icone: ClockAlert,
              titre: `${projetsEnRetard} projet${projetsEnRetard > 1 ? 's' : ''} en retard`,
              description: 'Dépassent la date de fin prévue',
              tonalite: 'attention' as const,
            },
            {
              icone: FolderKanban,
              titre: `${repartition.EN_ATTENTE ?? 0} projet${(repartition.EN_ATTENTE ?? 0) > 1 ? 's' : ''} en attente`,
              description: 'Soumis et en cours de traitement',
              tonalite: 'info' as const,
            },
            {
              icone: Handshake,
              titre: `${compteurs.partenaires_actifs ?? 0} partenaire${(compteurs.partenaires_actifs ?? 0) > 1 ? 's' : ''} actif${(compteurs.partenaires_actifs ?? 0) > 1 ? 's' : ''}`,
              description: 'Partenariats actuellement actifs',
              tonalite: 'ok' as const,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
