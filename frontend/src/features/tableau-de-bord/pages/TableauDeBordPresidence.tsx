// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx

import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useTableauDeBord } from '../api/useTableauDeBord';
import { CompteursGlobaux } from '../components/CompteursGlobaux';
import { GraphiqueStatuts } from '../components/GraphiqueStatuts';
import { RepartitionProjetsParStatut } from '../components/RepartitionProjetsParStatut';
import { ActiviteMensuelle } from '../components/ActiviteMensuelle';
import { ConventionsPrioritaires } from '../components/ConventionsPrioritaires';
import { BandeauEtat } from '../components/BandeauEtat';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';

export function TableauDeBordPresidence() {
  const { data: compteurs, isLoading: chargementCompteurs } = useTableauDeBord();

  return (
    <div>
      <PageHeader
        titre= "Tableau de bord"
        description="Vue consolidée des projets, partenariats et conventions sur l'ensemble des établissements."
        actions={
          <Link
            to="/presidence/export"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter
          </Link>
        }
      />

      <CompteursGlobaux compteurs={compteurs} chargement={chargementCompteurs} />

      {/* Ligne 1 : deux cartes de meme largeur et meme hauteur */}
      <div className="mb-[22px] grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <Panel className="h-full">
          <PanelHeader titre="Projets par statut" sousTitre="Répartition de tous les projets selon leur statut" />
          <PanelBody>
            <RepartitionProjetsParStatut projetsParStatut={compteurs?.projets_par_statut} chargement={chargementCompteurs} />
          </PanelBody>
        </Panel>

        <Panel className="h-full">
          <PanelHeader titre="Répartition des conventions" sousTitre="Par statut" />
          <PanelBody>
            <GraphiqueStatuts compteurs={compteurs} chargement={chargementCompteurs} />
          </PanelBody>
        </Panel>
      </div>

      {/* Ligne 2 : conventions a traiter (large) et activite mensuelle */}
      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            titre="Conventions à traiter"
            sousTitre="Les 5 priorités, classées par urgence"
            action={
              <Link
                to="/presidence/conventions"
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                Tout voir
              </Link>
            }
          />
          <ConventionsPrioritaires />
        </Panel>

        <Panel>
          <PanelHeader titre="Activité mensuelle" sousTitre="Conventions signées vs projets soumis" />
          <PanelBody>
            <ActiviteMensuelle />
          </PanelBody>
        </Panel>
      </div>

      <BandeauEtat compteurs={compteurs} chargement={chargementCompteurs} />
    </div>
  );
}
