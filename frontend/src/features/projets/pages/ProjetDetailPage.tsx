// src/features/projets/pages/ProjetDetailPage.tsx

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Archive, ExternalLink, Send, Pencil, Newspaper, Globe, Check } from 'lucide-react';
import { useProjet } from '../api/useProjet';
import { useArchiverProjet } from '../api/useArchiverProjet';
import { BoutonSoumettre } from '../components/BoutonSoumettre';
import { usePublierProjet } from '../api/usePublierProjet';
import { ProjetInformations } from '../components/ProjetInformations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';
import { DestructiveConfirmDialog } from '@/components/shared/DestructiveConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { LIBELLES_STATUT_PROJET } from '@/lib/status-mappings';
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

export function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [dialogueArchivageOuvert, setDialogueArchivageOuvert] = useState(false);
  const [dialoguePublierOuvert, setDialoguePublierOuvert] = useState(false);

  const { data: projet, isLoading } = useProjet(id ?? '');
  useTitreBreadcrumb(projet?.nom)
  const { mutate: archiver, isPending: enCoursArchivage } = useArchiverProjet();
  const publier = usePublierProjet(id ?? '');

  const role = utilisateur?.role;
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur';

  const estSoumis = Boolean(projet?.soumis_le);
  const estPublie = Boolean(projet?.publie_le);

  function onConfirmerArchivage() {
    if (!id) {
      return;
    }
    archiver(id, {
      onSuccess: () => {
        toast.success('Projet archivé');
        navigate(`${cheminBase}/projets`);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  function onConfirmerPublier() {
    publier.mutate(undefined, {
      onSuccess: () => {
        toast.success('Projet publié');
        setDialoguePublierOuvert(false);
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

  if (!projet) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Projet introuvable.</p>;
  }

  const info = LIBELLES_STATUT_PROJET[projet.statut] ?? LIBELLES_STATUT_PROJET.BROUILLON;

  return (
    <div>
      <PageHeader
        titre={projet.nom}
        description={projet.type}
        badge={
          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
        }
        actions={
          <div className="flex gap-2">
            {permissions.peutModifier && projet.statut === 'BROUILLON' ? (
              <Link
                to={`${cheminBase}/projets/${projet.id}/modifier`}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </Link>
            ) : null}

            {!estSoumis && permissions.peutSoumettre && projet.statut === 'BROUILLON' ? (
              <BoutonSoumettre projetId={projet.id} />
            ) : null}

            {estSoumis && !estPublie && permissions.estPresidence ? (
              <button
                type="button"
                onClick={() => setDialoguePublierOuvert(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Globe className="h-3.5 w-3.5" />
                Publier
              </button>
            ) : null}

            {estPublie && permissions.estPresidence ? (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--color-success-fg)]">
                <Check className="h-3 w-3" />
                Publié
              </span>
            ) : null}

            {permissions.peutArchiver ? (
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

      {estSoumis && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <Send className="h-3 w-3" />
          <span>
            Soumis à la Présidence le{" "}
            {new Date(projet.soumis_le ?? "").toLocaleDateString("fr-FR")}
          </span>
        </div>
      )}

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader titre="Informations générales" />
          <PanelBody>
            <ProjetInformations projet={projet} />
          </PanelBody>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader titre="Avancement" sousTitre="Progression globale du projet" />
            <PanelBody>
              <ProjetInformationsAvancement pourcentage={projet.avancement} />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader titre="Documents" sousTitre="Fichiers liés au projet" />
            <PanelBody>
              <Link
                to={`${cheminBase}/documents?projet=${projet.id}`}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Voir les documents
              </Link>
            </PanelBody>
          </Panel>

          {/* Une publication est toujours rattachee a un projet
              (relation un-avec-un) : creation via la fiche projet. */}
          {permissions.estPresidence ? (
            <Panel>
              <PanelHeader titre="Publication" sousTitre="Page publique liée au projet" />
              <PanelBody>
                <Link
                  to={`${cheminBase}/publications/${projet.id}`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                >
                  <Newspaper className="h-3.5 w-3.5" />
                  Gérer la publication
                </Link>
              </PanelBody>
            </Panel>
          ) : null}
        </div>
      </div>

      {permissions.peutArchiver ? (
        <DestructiveConfirmDialog
          ouvert={dialogueArchivageOuvert}
          onFermer={() => setDialogueArchivageOuvert(false)}
          onConfirmer={onConfirmerArchivage}
          titre="Archiver ce projet"
          description="Cette action retire le projet des listes actives. Il restera consultable dans les archives."
          nomCible={projet.nom}
          libelleAction="Archiver"
          enCours={enCoursArchivage}
        />
      ) : null}

      {estSoumis && !estPublie && permissions.estPresidence ? (
        <ConfirmDialog
          ouvert={dialoguePublierOuvert}
          onFermer={() => setDialoguePublierOuvert(false)}
          onConfirmer={onConfirmerPublier}
          titre="Publier ce projet ?"
          description="Le projet sera rendu visible sur l'espace public une fois publié."
          libelleAction="Publier"
          enCours={publier.isPending}
        />
      ) : null}
    </div>
  );
}

function ProjetInformationsAvancement({ pourcentage }: { pourcentage: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
        <span className="font-semibold text-[var(--color-text-secondary)]">Avancement</span>
        <span className="font-mono font-bold">{pourcentage}%</span>
      </div>
      <div className="h-[9px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]">
        <div className="h-full rounded-[var(--radius-sm)] bg-[var(--color-brand)]" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}
