// src/features/projets/pages/ProjetsListePage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Check, Send } from 'lucide-react';
import { useProjets } from '../api/useProjets';
import { useSoumettreEnMasseProjets } from '../api/useSoumettreEnMasseProjets';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { FilterChips } from '@/components/shared/FilterChips';
import { TablePagination } from '@/components/shared/TablePagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { formaterDate } from '@/lib/format';
import { LIBELLES_STATUT_PROJET } from '@/lib/status-mappings';
import type { StatutProjet } from '@/types/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LIMITE_PAR_PAGE = 20;

type FiltreProjet = 'tous' | 'BROUILLON' | 'EN_ATTENTE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'EXPIRE';

const OPTIONS_FILTRE = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'BROUILLON', libelle: 'Brouillons' },
  { cle: 'EN_ATTENTE', libelle: 'En attente' },
  { cle: 'EN_COURS', libelle: 'En cours' },
  { cle: 'SUSPENDU', libelle: 'Suspendus' },
  { cle: 'TERMINE', libelle: 'Terminés' },
  { cle: 'EXPIRE', libelle: 'Expirés' },
];

export function ProjetsListePage() {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<FiltreProjet>('tous');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [modeSelection, setModeSelection] = useState(false);

  const { data, isLoading } = useProjets({ page, limit: LIMITE_PAR_PAGE, recherche });

  const soumettreEnMasse = useSoumettreEnMasseProjets();

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';

  const projets = (data?.data ?? []).filter((projet) => {
    if (filtre === 'tous') return true;
    return projet.statut === filtre;
  });

  const estSelectionne = (id: string) => selection.has(id);
  const basculerSelection = (id: string) => {
    setSelection((precedente) => {
      const suivante = new Set(precedente);
      if (suivante.has(id)) suivante.delete(id);
      else suivante.add(id);
      return suivante;
    });
  };
  const basculerTout = () => {
    if (selection.size === projets.length) {
      setSelection(new Set());
    } else {
      setSelection(new Set(projets.map((p) => p.id)));
    }
  };
  const peutSoumettreSelection = Array.from(selection).some(
    (id) => !projets.find((p) => p.id === id)?.soumis_le,
  );

  const handleSoumettreSelection = async () => {
    const ids = Array.from(selection);
    const resultat = await soumettreEnMasse.mutateAsync(ids);
    setSelection(new Set());
    setModeSelection(false);
    toast.success(`${resultat.reussis.length} projet${resultat.reussis.length > 1 ? 's' : ''} soumis`);
    if (resultat.echecs.length > 0) {
      toast.error(`${resultat.echecs.length} echec${resultat.echecs.length > 1 ? 's' : ''} lors de la soumission`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titre="Projets"
        description="Tous les projets de la plateforme."
        actions={
          <>
            {permissions.peutCreer ? (
              <Link
                to={`${cheminBase}/projets/nouveau`}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouveau projet
              </Link>
            ) : null}

            {modeSelection && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModeSelection(false)}
                  disabled={soumettreEnMasse.isPending}
                >
                  Annuler la sélection
                </Button>
                <Button
                  onClick={handleSoumettreSelection}
                  disabled={
                    !peutSoumettreSelection || soumettreEnMasse.isPending || selection.size === 0
                  }
                >
                  {soumettreEnMasse.isPending ? (
                    <>
                      <Send className="h-3.5 w-3.5 animate-spin" /> Soumission…
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Soumettre la sélection ({selection.size})
                    </>
                  )}
                </Button>
              </>
            )}
          </>
        }
      />

      <Panel>
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

        {projets.length === 0 ? (
          <EmptyState
            icone={FolderKanban}
            titre={recherche ? 'Aucun résultat pour cette recherche' : 'Aucun projet enregistré'}
            description={recherche ? 'Essayez avec un autre terme de recherche.' : 'Les projets ajoutés apparaîtront ici.'}
          />
        ) : (
          <PanelBody>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {modeSelection ? (
                      <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px]">
                        <input
                          type="checkbox"
                          checked={selection.size === projets.length && projets.length > 0}
                          onChange={basculerTout}
                          aria-label="Selectionner tout"
                        />
                      </th>
                    ) : null}
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Nom</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Type</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Échéance</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Avancement</th>
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Statut</th>
                    {modeSelection ? (
                      <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Soumettre</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {projets.map((projet) => {
                    const info = LIBELLES_STATUT_PROJET[projet.statut as StatutProjet] ?? LIBELLES_STATUT_PROJET.BROUILLON;
                    const dejaSoumis = Boolean(projet.soumis_le);

                    return (
                      <tr key={projet.id} className="hover:bg-[var(--color-page-bg)]">
                        {modeSelection ? (
                          <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                            {(!dejaSoumis && projet.statut === 'BROUILLON') ? (
                              <input
                                type="checkbox"
                                checked={estSelectionne(projet.id)}
                                onChange={() => basculerSelection(projet.id)}
                                aria-label={`Selectionner ${projet.nom}`}
                              />
                            ) : null}
                          </td>
                        ) : null}
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <Link
                            to={`${cheminBase}/projets/${projet.id}`}
                            className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                          >
                            {projet.nom}
                          </Link>
                          {dejaSoumis ? (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
                              Soumis
                            </span>
                          ) : null}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">{projet.type}</td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                          {formaterDate(projet.date_fin_prevue)}
                          {projet.en_retard ? (
                            <span className="ml-1.5 text-[var(--status-expire-fg)]">retard</span>
                          ) : null}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <div className="flex items-center gap-2">
                            <div className="h-[6px] w-20 overflow-hidden rounded-full bg-[var(--color-page-bg)]">
                              <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${projet.avancement}%` }} />
                            </div>
                            <span className="font-mono text-xs text-[var(--color-text-secondary)]">{projet.avancement}%</span>
                          </div>
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                        </td>
                        {modeSelection ? (
                          <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                            {(!dejaSoumis && projet.statut === 'BROUILLON') ? (
                              <button
                                type="button"
                                onClick={() => basculerSelection(projet.id)}
                                className="rounded-sm border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-page-bg)]"
                                title={estSelectionne(projet.id) ? 'Déselectionner' : 'Sélectionner'}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-[var(--color-text-secondary)]">Déjà soumis</span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data?.meta && <TablePagination meta={data.meta} onChangerPage={setPage} />}
          </PanelBody>
        )}
      </Panel>
    </div>
  );
}
