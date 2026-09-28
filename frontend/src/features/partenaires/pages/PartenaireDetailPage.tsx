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
import { DestructiveConfirmDialog } from '@/components/shared/DestructiveConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

export function PartenaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [dialogueArchivageOuvert, setDialogueArchivageOuvert] = useState(false);

  const { data: partenaire, isLoading } = usePartenaire(id ?? '');
  const { mutate: mettreAJour, isPending: enCoursMiseAJour } = useUpdatePartenaire();
  const { mutate: archiver, isPending: enCoursArchivage } = useArchiverPartenaire();

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';
  const peutModifier = role === 'PRESIDENCE' || role === 'ETABLISSEMENT';
  const peutArchiver = role === 'PRESIDENCE';

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
      <div className="mb-[26px] flex items-start justify-between gap-5">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <h1 className="text-[24px] font-bold">{partenaire.nom}</h1>
            <StatusBadge
              libelle={partenaire.statut === 'ACTIF' ? 'Actif' : 'Suspendu'}
              tonalite={partenaire.statut === 'ACTIF' ? 'actif' : 'attente'}
            />
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {partenaire.type} — {partenaire.pays}
          </p>
        </div>

        {peutArchiver ? (
          <button
            type="button"
            onClick={() => setDialogueArchivageOuvert(true)}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--status-expire-fg)] hover:text-[var(--status-expire-fg)]"
          >
            <Archive className="h-3.5 w-3.5" />
            Archiver
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h3 className="text-[15px] font-bold">Informations</h3>
          </div>
          <div className="p-5">
            {peutModifier ? (
              <PartenaireForm partenaire={partenaire} onSoumettre={onSoumettre} enCours={enCoursMiseAJour} />
            ) : (
              <PartenaireInformations partenaire={partenaire} />
            )}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <PartenaireCoordonnees partenaire={partenaire} />
          <ContactsSection partenaireId={partenaire.id} contacts={partenaire.contacts} peutGerer={peutModifier} />
        </div>
      </div>

      {peutArchiver ? (
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