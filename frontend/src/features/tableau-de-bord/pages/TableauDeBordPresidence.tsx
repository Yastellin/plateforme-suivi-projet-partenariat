// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx

import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useTableauDeBord } from '../api/useTableauDeBord';
import { CompteursGlobaux } from '../components/CompteursGlobaux';
import { GraphiqueStatuts } from '../components/GraphiqueStatuts';
import { ActiviteMensuelle } from '../components/ActiviteMensuelle';
import { EcheancierListe } from '../components/EcheancierListe';
import { BandeauEtat } from '../components/BandeauEtat';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';

export function TableauDeBordPresidence() {
  const { data: compteurs, isLoading: chargementCompteurs } = useTableauDeBord();

  const anneeCourante = new Date().getFullYear();

  return (
    <div>
      <PageHeader
        titre={`Tableau de bord — Synthèse ${anneeCourante}`}
        description="Vue consolidée des projets, partenariats et conventions sur l'ensemble des établissements."
        actions={
          <Link
            to="/presidence/export"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter
          </Link>
        }
      />

      <CompteursGlobaux compteurs={compteurs} chargement={chargementCompteurs} />

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            titre="Conventions à traiter"
            sousTitre="Renouvellements, avenants et circuits en attente"
            action={
              <Link
                to="/presidence/conventions"
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                Tout voir
              </Link>
            }
          />
          <EcheancierListe />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader titre="Activité mensuelle" sousTitre="Conventions signées vs projets soumis" />
            <PanelBody>
              <ActiviteMensuelle />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader titre="Répartition des conventions" sousTitre="Par statut" />
            <PanelBody>
              <GraphiqueStatuts compteurs={compteurs} chargement={chargementCompteurs} />
            </PanelBody>
          </Panel>
        </div>
      </div>

      <BandeauEtat compteurs={compteurs} chargement={chargementCompteurs} />
    </div>
  );
}
