// src/features/partenaires/pages/PartenaireDetailPage.tsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';
import { usePartenaire } from '../api/usePartenaire';
import { useUpdatePartenaire } from '../api/useUpdatePartenaire';
import { useArchiverPartenaire } from '../api/useArchiverPartenaire';
import { PartenaireForm } from '../components/PartenaireForm';
import { PartenaireInformations } from '../components/PartenaireInformations';
import { PartenaireCoordonnees } from '../components/PartenaireCoordonnees';
import { ContactsSection } from '../components/ContactsSection';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';
import { DestructiveConfirmDialog } from '@/components/shared/DestructiveConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

export function PartenaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [dialogueArchivageOuvert, setDialogueArchivageOuvert] = useState(false);

  const { data: partenaire, isLoading } = usePartenaire(id ?? '');
  const { mutate: mettreAJour, isPending: enCoursMiseAJour } = useUpdatePartenaire();
  const { mutate: archiver, isPending: enCoursArchivage } = useArchiverPartenaire();

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';

  function onSoumettre(valeurs: PartenaireFormValues) {
    if (!id) {
      return;
    }
    mettreAJour(
      { id, valeurs },
      {
        onSuccess: () => toast.success('Partenaire mis à jour'),
        onError: (erreur) => toast.error(erreur.message),
      },
    );
  }

  function onConfirmerArchivage() {
    if (!id) {
      return;
    }
    archiver(id, {
      onSuccess: () => {
        toast.success('Partenaire archivé');
        navigate(`${cheminBase}/partenaires-partenariats/partenaires`);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  if (!partenaire) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Partenaire introuvable.</p>;
  }

  return (
    <div>
      <PageHeader
        titre={partenaire.nom}
        description={`${partenaire.type} — ${partenaire.pays}`}
        badge={
          <StatusBadge
            libelle={partenaire.statut === 'ACTIF' ? 'Actif' : 'Suspendu'}
            tonalite={partenaire.statut === 'ACTIF' ? 'actif' : 'attente'}
          />
        }
        actions={
          permissions.peutArchiver ? (
            <button
              type="button"
              onClick={() => setDialogueArchivageOuvert(true)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--status-expire-fg)] hover:text-[var(--status-expire-fg)]"
            >
              <Archive className="h-3.5 w-3.5" />
              Archiver
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader titre="Informations" sousTitre="Fiche du partenaire" />
          <PanelBody>
            {permissions.peutModifier ? (
              <PartenaireForm partenaire={partenaire} onSoumettre={onSoumettre} enCours={enCoursMiseAJour} />
            ) : (
              <PartenaireInformations partenaire={partenaire} />
            )}
          </PanelBody>
        </Panel>

        <div className="flex flex-col gap-4">
          <PartenaireCoordonnees partenaire={partenaire} />
          <ContactsSection partenaireId={partenaire.id} contacts={partenaire.contacts} peutGerer={permissions.peutModifier} />
        </div>
      </div>

      {permissions.peutArchiver ? (
        <DestructiveConfirmDialog
          ouvert={dialogueArchivageOuvert}
          onFermer={() => setDialogueArchivageOuvert(false)}
          onConfirmer={onConfirmerArchivage}
          titre="Archiver ce partenaire"
          description="Cette action retire le partenaire des listes actives. Il restera consultable dans les archives."
          nomCible={partenaire.nom}
          libelleAction="Archiver"
          enCours={enCoursArchivage}
        />
      ) : null}
    </div>
  );
}
