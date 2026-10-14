// src/features/synthese/pages/SyntheseEtablissementPage.tsx

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, FileText, Handshake } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody, PanelHeader } from '@/components/shared/Panel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTitreBreadcrumb } from '@/contexts/TitreBreadcrumbContext';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { cheminBaseRole } from '@/lib/roles';
import { useSyntheseEtablissement } from '../api/useSyntheseEtablissement';
import { SyntheseAnneeSelecteur } from '../components/SyntheseAnneeSelecteur';
import { SyntheseCompteurs } from '../components/SyntheseCompteurs';
import { SyntheseNarratif } from '../components/SyntheseNarratif';
import { SynthesePartenairesStrategiques } from '../components/SynthesePartenairesStrategiques';
import { nombreTypesRenseignes, tauxCompletudeSynthese } from '../lib/synthese';

/**
 * Synthèse détaillée d'un établissement : compteurs, éléments narratifs et
 * partenaires stratégiques. La Présidence gère les contenus, le Décideur
 * consulte en lecture seule.
 */
export function SyntheseEtablissementPage() {
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const [annee, setAnnee] = useState(() => new Date().getFullYear());
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const cheminBase = cheminBaseRole(utilisateur?.role);

  const { data, isLoading, isError, refetch } = useSyntheseEtablissement(etablissementId ?? '', annee);
  useTitreBreadcrumb(data?.etablissement_nom);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[120px] w-full rounded-[var(--radius)]" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <PageHeader
          titre="Synthèse de l’établissement"
          description={`Aucune synthèse disponible pour l’année ${annee}.`}
          actions={<SyntheseAnneeSelecteur annee={annee} onAnneeChange={setAnnee} />}
        />
        <Panel>
          <EmptyState
            icone={Building2}
            titre="Synthèse introuvable"
            description="Cet établissement n’existe pas ou sa synthèse n’a pas pu être chargée."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
                >
                  Réessayer
                </button>
                <Link
                  to={`${cheminBase}/synthese`}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                >
                  Retour aux synthèses
                </Link>
              </div>
            }
          />
        </Panel>
      </div>
    );
  }

  const elementsRenseignes = nombreTypesRenseignes(data.items);
  const completude = tauxCompletudeSynthese(data.items);

  return (
    <div>
      <PageHeader
        titre={data.etablissement_nom}
        description={`Synthèse annuelle ${data.annee} — ${elementsRenseignes} élément${elementsRenseignes > 1 ? 's' : ''} narratif${elementsRenseignes > 1 ? 's' : ''} renseigné${elementsRenseignes > 1 ? 's' : ''} sur 3.`}
        badge={<Badge variant="outline">{completude}% complété</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`${cheminBase}/synthese`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Toutes les synthèses
            </Link>
            <SyntheseAnneeSelecteur annee={annee} onAnneeChange={setAnnee} id="synthese-annee-etablissement" />
          </div>
        }
      />

      <SyntheseCompteurs compteurs={data.compteurs} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            titre="Éléments narratifs"
            sousTitre="Domaine principal, défi majeur et priorité future"
            action={<FileText className="h-4 w-4 text-[var(--color-text-secondary)]" />}
          />
          <PanelBody>
            <SyntheseNarratif
              etablissementId={data.etablissement_id}
              annee={data.annee}
              items={data.items}
              peutGerer={permissions.estPresidence}
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            titre="Partenaires stratégiques"
            sousTitre={`Désignés pour ${data.annee}`}
            action={<Handshake className="h-4 w-4 text-[var(--color-text-secondary)]" />}
          />
          <PanelBody>
            <SynthesePartenairesStrategiques
              etablissementId={data.etablissement_id}
              annee={data.annee}
              partenaires={data.partenaires_strategiques}
              peutGerer={permissions.estPresidence}
            />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
