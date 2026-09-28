// src/features/partenariats/pages/PartenariatDetailPage.tsx

<<<<<<< Updated upstream
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PartenariatForm } from "@/features/partenariats/components/PartenariatForm"
import { BoutonSoumettre } from "@/features/partenariats/components/BoutonSoumettre"
import { usePartenariat } from "@/features/partenariats/api/usePartenariat"
import { useAuth } from "@/hooks/useAuth"

export function PartenariatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const [modificationOuverte, setModificationOuverte] = useState(false)

  const { data: partenariat, isLoading } = usePartenariat(id)

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>
=======
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
import { DestructiveConfirmDialog } from '@/components/shared/DestructiveConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { LIBELLES_DOMAINE_PARTENARIAT, LIBELLES_STATUT_PARTENARIAT } from '@/lib/status-mappings';
import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';

export function PartenariatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [dialogueArchivageOuvert, setDialogueArchivageOuvert] = useState(false);

  const { data: partenariat, isLoading } = usePartenariat(id ?? '');
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
>>>>>>> Stashed changes
  }

  if (!partenariat) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Partenariat introuvable.</p>;
  }

<<<<<<< Updated upstream
  const modifiable = partenariat.statut === "BROUILLON" && utilisateur?.role === "ETABLISSEMENT"

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
=======
  const info = LIBELLES_STATUT_PARTENARIAT[partenariat.statut];
  const estBrouillon = partenariat.statut === 'BROUILLON';
  const peutModifier = estPresidence || (role === 'ETABLISSEMENT' && estBrouillon);
  const peutSoumettre = (estPresidence || role === 'ETABLISSEMENT') && estBrouillon;
  const soumisParEtablissement = role === 'ETABLISSEMENT' && !estBrouillon;

  return (
    <div>
      <div className="mb-[26px] flex flex-wrap items-start justify-between gap-5">
>>>>>>> Stashed changes
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-bold">{partenariat.intitule}</h1>
            <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}
          </p>
        </div>
<<<<<<< Updated upstream
        <div className="flex gap-2">
          {modifiable && (
            <button
              onClick={() => setModificationOuverte(true)}
              className="text-sm text-primary underline"
            >
              Modifier
            </button>
          )}
          {/* Section 5 : uniquement l'Etablissement peut soumettre, uniquement en BROUILLON */}
          {modifiable && <BoutonSoumettre partenariatId={partenariat.id} />}
        </div>
      </div>

      {partenariat.objet && (
        <p className="mb-4 text-sm text-muted-foreground">{partenariat.objet}</p>
      )}

      <div className="grid grid-cols-2 gap-6">
        {partenariat.actions_realisees && (
          <div>
            <h3 className="font-heading text-sm font-semibold">Actions realisees</h3>
            <p className="text-sm text-muted-foreground">{partenariat.actions_realisees}</p>
          </div>
        )}
        {partenariat.actions_en_cours && (
          <div>
            <h3 className="font-heading text-sm font-semibold">Actions en cours</h3>
            <p className="text-sm text-muted-foreground">{partenariat.actions_en_cours}</p>
          </div>
        )}
      </div>

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le partenariat</DialogTitle>
          </DialogHeader>
          <PartenariatForm
            partenariat={partenariat}
            onSucces={() => {
              setModificationOuverte(false)
              toast.success("Partenariat mis a jour")
            }}
            onAnnuler={() => setModificationOuverte(false)}
          />
        </DialogContent>
      </Dialog>
=======

        <div className="flex items-center gap-2.5">
          {peutSoumettre ? <BoutonSoumettre partenariatId={partenariat.id} intitule={partenariat.intitule} /> : null}
          {estPresidence ? (
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
      </div>

      {soumisParEtablissement ? (
        <p className="mb-5 rounded-[var(--radius-sm)] bg-[var(--status-attente-bg)] px-4 py-3 text-[13px] font-medium text-[var(--status-attente-fg)]">
          Ce partenariat a été soumis. Il n'est plus modifiable.
        </p>
      ) : null}

      {peutModifier ? (
        <PartenariatForm
          partenariat={partenariat}
          estPresidence={estPresidence}
          onSoumettre={onSoumettre}
          enCours={enCoursMiseAJour}
        />
      ) : (
        <PartenariatInformations partenariat={partenariat} cheminBase={cheminBase} />
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
>>>>>>> Stashed changes
    </div>
  );
}