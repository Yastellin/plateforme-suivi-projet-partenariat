// src/features/partenariats/pages/PartenariatDetailPage.tsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';
import { usePartenariat } from '../api/usePartenariat';
import { useUpdatePartenariat } from '../api/useUpdatePartenariat';
import { useArchiverPartenariat } from '../api/useArchiverPartenariat';
import { PartenariatForm } from '../components/PartenariatForm';
import { PartenariatInformations } from '../components/PartenariatInformations';
import { BoutonSoumettre } from '../components/BoutonSoumettre';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';
import { DestructiveConfirmDialog } from '@/components/shared/DestructiveConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { LIBELLES_DOMAINE_PARTENARIAT, LIBELLES_STATUT_PARTENARIAT } from '@/lib/status-mappings';
import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

export function PartenariatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [dialogueArchivageOuvert, setDialogueArchivageOuvert] = useState(false);

  const { data: partenariat, isLoading } = usePartenariat(id ?? '');
  useTitreBreadcrumb(partenariat?.intitule)
  const { mutate: mettreAJour, isPending: enCoursMiseAJour } = useUpdatePartenariat();
  const { mutate: archiver, isPending: enCoursArchivage } = useArchiverPartenariat();

  const role = utilisateur?.role;
  const estPresidence = role === 'PRESIDENCE';
  const cheminBase = estPresidence ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';

  function onSoumettre(valeurs: PartenariatFormValues) {
    if (!id) {
      return;
    }
    mettreAJour(
      { id, valeurs },
      {
        onSuccess: () => toast.success('Partenariat mis à jour'),
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
        toast.success('Partenariat archivé');
        navigate(`${cheminBase}/partenaires-partenariats/partenariats`);
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

  if (!partenariat) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Partenariat introuvable.</p>;
  }

  const info = LIBELLES_STATUT_PARTENARIAT[partenariat.statut];
  const estBrouillon = partenariat.statut === 'BROUILLON';
  const peutModifier = estPresidence || (role === 'ETABLISSEMENT' && estBrouillon);
  const peutSoumettre = (estPresidence || role === 'ETABLISSEMENT') && estBrouillon;
  const soumisParEtablissement = role === 'ETABLISSEMENT' && !estBrouillon;

  return (
    <div>
      <PageHeader
        titre={partenariat.intitule}
        description={LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}
        badge={<StatusBadge libelle={info.libelle} tonalite={info.tonalite} />}
        actions={
          <div className="flex gap-2">
            {peutSoumettre ? <BoutonSoumettre partenariatId={partenariat.id} intitule={partenariat.intitule} /> : null}
            {estPresidence ? (
              <button
                type="button"
                onClick={() => setDialogueArchivageOuvert(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--status-expire-fg)] hover:text-[var(--status-expire-fg)]"
              >
                <Archive className="h-3.5 w-3.5" />
                Archiver
              </button>
            ) : null}
          </div>
        }
      />

      {soumisParEtablissement ? (
        <p className="mb-[22px] rounded-[var(--radius-sm)] bg-[var(--status-attente-bg)] px-4 py-3 text-[13px] font-medium text-[var(--status-attente-fg)]">
          Ce partenariat a été soumis. Il n'est plus modifiable.
        </p>
      ) : null}

      {peutModifier ? (
        <Panel>
          <PanelHeader titre="Modifier le partenariat" />
          <PanelBody>
            <PartenariatForm
              partenariat={partenariat}
              estPresidence={estPresidence}
              onSoumettre={onSoumettre}
              enCours={enCoursMiseAJour}
            />
          </PanelBody>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader titre="Informations" sousTitre="Fiche du partenariat" />
          <PanelBody>
            <PartenariatInformations partenariat={partenariat} cheminBase={cheminBase} />
          </PanelBody>
        </Panel>
      )}

      {estPresidence ? (
        <DestructiveConfirmDialog
          ouvert={dialogueArchivageOuvert}
          onFermer={() => setDialogueArchivageOuvert(false)}
          onConfirmer={onConfirmerArchivage}
          titre="Archiver ce partenariat"
          description="Cette action retire le partenariat des listes actives. Il restera consultable dans les archives."
          nomCible={partenariat.intitule}
          libelleAction="Archiver"
          enCours={enCoursArchivage}
        />
      ) : null}
    </div>
  );
}
