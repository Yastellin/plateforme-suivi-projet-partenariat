// src/features/tableau-de-bord/pages/TableauDeBordDecideur.tsx

import { useTableauDeBord } from '../api/useTableauDeBord';
import { useComparatifEtablissements } from '../api/useComparatifEtablissements';
import { CompteursGlobaux } from '../components/CompteursGlobaux';
import { GraphiqueComparatif } from '../components/GraphiqueComparatif';
import { GraphiqueStatuts } from '../components/GraphiqueStatuts';
import { ActiviteMensuelle } from '../components/ActiviteMensuelle';
import { EcheancierListe } from '../components/EcheancierListe';
import { BandeauEtat } from '../components/BandeauEtat';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';

export function TableauDeBordDecideur() {
  const { data: compteurs, isLoading: chargementCompteurs } = useTableauDeBord();
  const { data: comparatif, isLoading: chargementComparatif } = useComparatifEtablissements();

  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        description="Vue d'ensemble comparative des établissements."
      />

      <CompteursGlobaux compteurs={compteurs} chargement={chargementCompteurs} />

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader titre="Comparatif par établissement" sousTitre="Partenaires et projets par établissement" />
          <PanelBody>
            <GraphiqueComparatif donnees={comparatif} chargement={chargementComparatif} />
          </PanelBody>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader titre="Répartition des conventions" sousTitre="Par statut" />
            <PanelBody>
              <GraphiqueStatuts compteurs={compteurs} chargement={chargementCompteurs} />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader titre="Activité mensuelle" sousTitre="Conventions signées vs projets soumis" />
            <PanelBody>
              <ActiviteMensuelle />
            </PanelBody>
          </Panel>
        </div>
      </div>

      <Panel className="mb-[22px]">
        <PanelHeader titre="Conventions à échéance" sousTitre="Lecture seule" />
        <EcheancierListe compact />
      </Panel>

      <BandeauEtat compteurs={compteurs} chargement={chargementCompteurs} />
    </div>
  );
}
