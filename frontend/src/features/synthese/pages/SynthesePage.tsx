// src/features/synthese/pages/SynthesePage.tsx

import { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody, PanelHeader } from '@/components/shared/Panel';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { cheminBaseRole } from '@/lib/roles';
import { usePartenairesStrategiques } from '../api/usePartenairesStrategiques';
import { useSyntheseGlobale } from '../api/useSyntheseGlobale';
import { useSyntheseItems } from '../api/useSyntheseItems';
import { SyntheseAnneeSelecteur } from '../components/SyntheseAnneeSelecteur';
import { SyntheseAvancement } from '../components/SyntheseAvancement';
import { SyntheseComparatif } from '../components/SyntheseComparatif';
import { SyntheseCompteurs } from '../components/SyntheseCompteurs';
import { SyntheseListePartenairesStrategiques } from '../components/SyntheseListePartenairesStrategiques';
import { SyntheseNarratifConsolide } from '../components/SyntheseNarratifConsolide';
import { SyntheseTableauEtablissements } from '../components/SyntheseTableauEtablissements';
import { TYPES_ITEM_SYNTHESE, construireComparatif, totaliserSyntheseGlobale } from '../lib/synthese';
import type { SyntheseEtablissement } from '@/types/api';

const VALEUR_TOUS = 'TOUS';

/** Sélecteur natif utilisé pour les filtres de la synthèse. */
function FiltreSelect({
  id,
  libelle,
  valeur,
  onChange,
  options,
}: {
  id: string;
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  options: { valeur: string; libelle: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
        {libelle}
      </label>
      <select
        id={id}
        value={valeur}
        onChange={(evenement) => onChange(evenement.target.value)}
        className="max-w-[220px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
      >
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}

function optionsEtablissements(etablissements: SyntheseEtablissement[]) {
  return [
    { valeur: VALEUR_TOUS, libelle: 'Tous les établissements' },
    ...etablissements.map((etablissement) => ({
      valeur: etablissement.etablissement_id,
      libelle: etablissement.etablissement_nom,
    })),
  ];
}

/**
 * Synthèse annuelle consolidée : compteurs de tous les établissements,
 * comparatif, avancement de la campagne, éléments narratifs et partenaires
 * stratégiques. Consultable par la Présidence et le Décideur (lecture seule
 * pour ce dernier).
 */
export function SynthesePage() {
  const [annee, setAnnee] = useState(() => new Date().getFullYear());
  const [filtreType, setFiltreType] = useState(VALEUR_TOUS);
  const [filtreEtablissement, setFiltreEtablissement] = useState(VALEUR_TOUS);
  const [filtreEtablissementPartenaires, setFiltreEtablissementPartenaires] = useState(VALEUR_TOUS);
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const cheminBase = cheminBaseRole(utilisateur?.role);

  const { data, isLoading, isError, refetch } = useSyntheseGlobale(annee);

  const etablissements = useMemo(() => data?.etablissements ?? [], [data]);
  const totaux = useMemo(() => totaliserSyntheseGlobale(etablissements), [etablissements]);
  const lignes = useMemo(() => construireComparatif(etablissements), [etablissements]);

  const filtresItems = useMemo(
    () => ({
      annee,
      type: filtreType === VALEUR_TOUS ? undefined : filtreType,
      etablissement_id: filtreEtablissement === VALEUR_TOUS ? undefined : filtreEtablissement,
    }),
    [annee, filtreType, filtreEtablissement],
  );
  const { data: itemsNarratifs, isLoading: chargementItems } = useSyntheseItems(filtresItems);

  const filtresPartenaires = useMemo(
    () => ({
      annee,
      etablissement_id:
        filtreEtablissementPartenaires === VALEUR_TOUS ? undefined : filtreEtablissementPartenaires,
    }),
    [annee, filtreEtablissementPartenaires],
  );
  const { data: partenairesStrategiques, isLoading: chargementPartenaires } =
    usePartenairesStrategiques(filtresPartenaires);

  if (isError) {
    return (
      <div>
        <PageHeader titre="Synthèse annuelle" description="Vue consolidée de l’activité des établissements." />
        <Panel>
          <EmptyState
            icone={BarChart3}
            titre="Impossible de charger la synthèse"
            description="La synthèse de l’année n’a pas pu être récupérée. Vérifiez votre connexion puis réessayez."
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
              >
                Réessayer
              </button>
            }
          />
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titre="Synthèse annuelle"
        description={
          isLoading
            ? 'Chargement de la synthèse…'
            : `Vue consolidée de ${etablissements.length} établissement${etablissements.length > 1 ? 's' : ''} pour l’année ${annee}.`
        }
        badge={<Badge variant="outline">{annee}</Badge>}
        actions={<SyntheseAnneeSelecteur annee={annee} onAnneeChange={setAnnee} />}
      />

      <SyntheseCompteurs compteurs={totaux.compteurs} enChargement={isLoading} />

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            titre="Comparatif par établissement"
            sousTitre="Partenaires, conventions actives et projets actifs"
          />
          <PanelBody>
            <SyntheseComparatif lignes={lignes} enChargement={isLoading} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader titre="Avancement de la synthèse" sousTitre={`Campagne ${annee}`} />
          <PanelBody>
            <SyntheseAvancement
              totaux={totaux}
              nombreEtablissements={etablissements.length}
              enChargement={isLoading}
            />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mb-[22px]">
        <PanelHeader
          titre="Détail par établissement"
          sousTitre="Compteurs de l’année et complétude de la synthèse narrative"
          action={
            <Badge variant="secondary">
              {etablissements.length} établissement{etablissements.length > 1 ? 's' : ''}
            </Badge>
          }
        />
        <SyntheseTableauEtablissements lignes={lignes} cheminBase={cheminBase} enChargement={isLoading} />
      </Panel>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            titre="Éléments narratifs"
            sousTitre="Domaine principal, défi majeur et priorité future"
            action={
              <div className="flex flex-wrap items-center gap-3">
                <FiltreSelect
                  id="synthese-filtre-type"
                  libelle="Type"
                  valeur={filtreType}
                  onChange={setFiltreType}
                  options={[
                    { valeur: VALEUR_TOUS, libelle: 'Tous les types' },
                    ...TYPES_ITEM_SYNTHESE.map((type) => ({ valeur: type.valeur, libelle: type.libelle })),
                  ]}
                />
                <FiltreSelect
                  id="synthese-filtre-etablissement"
                  libelle="Établissement"
                  valeur={filtreEtablissement}
                  onChange={setFiltreEtablissement}
                  options={optionsEtablissements(etablissements)}
                />
              </div>
            }
          />
          <SyntheseNarratifConsolide
            items={itemsNarratifs ?? []}
            etablissements={etablissements}
            cheminBase={cheminBase}
            peutGerer={permissions.estPresidence}
            enChargement={chargementItems}
          />
        </Panel>

        <Panel>
          <PanelHeader
            titre="Partenaires stratégiques"
            sousTitre={`Désignations de l’année ${annee}`}
            action={
              <FiltreSelect
                id="synthese-filtre-partenaire-etablissement"
                libelle="Établissement"
                valeur={filtreEtablissementPartenaires}
                onChange={setFiltreEtablissementPartenaires}
                options={optionsEtablissements(etablissements)}
              />
            }
          />
          <PanelBody>
            <SyntheseListePartenairesStrategiques
              partenaires={partenairesStrategiques ?? []}
              etablissements={etablissements}
              cheminBase={cheminBase}
              enChargement={chargementPartenaires}
            />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
