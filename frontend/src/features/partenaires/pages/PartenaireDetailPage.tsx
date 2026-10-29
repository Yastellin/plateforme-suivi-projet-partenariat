// src/features/partenaires/pages/PartenaireDetailPage.tsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Archive, Check, Globe, Pencil, Send } from "lucide-react";
import { usePartenaire } from "../api/usePartenaire";
import { useUpdatePartenaire } from "../api/useUpdatePartenaire";
import { useArchiverPartenaire } from "../api/useArchiverPartenaire";
import { PartenaireForm } from "../components/PartenaireForm";
import { PartenaireInformations } from "../components/PartenaireInformations";
import { PartenaireCoordonnees } from "../components/PartenaireCoordonnees";
import { ContactsSection } from "../components/ContactsSection";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel";
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import type { PartenaireFormValues } from "@/lib/validators/partenaire.schema";
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext";
import { useActionWorkflow } from "@/features/soumissions/api/useActionWorkflow";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LogoUploader } from "@/components/shared/LogoUploader";

export function PartenaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [dialogueArchivageOuvert, setDialogueArchivageOuvert] = useState(false);
  const [editionEnCours, setEditionEnCours] = useState(false);
  const [actionWorkflow, setActionWorkflow] = useState<
    "soumettre" | "rendre-visible" | null
  >(null);

  const { data: partenaire, isLoading } = usePartenaire(id ?? "");
  useTitreBreadcrumb(partenaire?.nom);
  const { mutate: mettreAJour, isPending: enCoursMiseAJour } =
    useUpdatePartenaire();
  const { mutate: archiver, isPending: enCoursArchivage } =
    useArchiverPartenaire();
  const soumission = useActionWorkflow("partenaires", id ?? "", "soumettre");
  const miseEnVitrine = useActionWorkflow(
    "partenaires",
    id ?? "",
    "publier",
  );

  const role = utilisateur?.role;
  const cheminBase =
    role === "PRESIDENCE"
      ? "/presidence"
      : role === "ETABLISSEMENT"
        ? "/etablissement"
        : "/decideur";

  function onSoumettre(valeurs: PartenaireFormValues) {
    if (!id) {
      return;
    }
    mettreAJour(
      { id, valeurs },
      {
        onSuccess: () => {
          toast.success("Partenaire mis à jour");
          navigate(`${cheminBase}/partenaires-partenariats/partenaires`);
        },
        onError: (erreur) => toast.error(erreur.message),
      },
    );
  }

  function confirmerWorkflow() {
    const commande =
      actionWorkflow === "soumettre" ? soumission : miseEnVitrine;
    const libelle =
      actionWorkflow === "soumettre"
        ? "Partenaire soumis à la Présidence"
        : "Partenaire visible sur la vitrine";
    commande.mutate(undefined, {
      onSuccess: () => {
        toast.success(libelle);
        setActionWorkflow(null);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  function onConfirmerArchivage() {
    if (!id) {
      return;
    }
    archiver(id, {
      onSuccess: () => {
        toast.success("Partenaire archivé");
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
    return (
      <p className="text-[13.5px] text-[var(--color-text-secondary)]">
        Partenaire introuvable.
      </p>
    );
  }

  const peutModifierPartenaire =
    permissions.estPresidence ||
    (permissions.estEtablissement &&
      partenaire.cree_par_role === "ETABLISSEMENT" &&
      !partenaire.soumis_le);
  const presenceVitrine = partenaire.visibilite === "PUBLIC";
  const visibleSurVitrine = presenceVitrine && partenaire.statut === "ACTIF";

  return (
    <div>
      <PageHeader
        titre={partenaire.nom}
        description={`${partenaire.type} — ${partenaire.pays}`}
        badge={
          <StatusBadge
            libelle={partenaire.statut === "ACTIF" ? "Actif" : "Suspendu"}
            tonalite={partenaire.statut === "ACTIF" ? "actif" : "attente"}
          />
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {peutModifierPartenaire && !editionEnCours ? (
              <button
                type="button"
                onClick={() => setEditionEnCours(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
              >
                <Pencil className="h-3.5 w-3.5" /> Modifier
              </button>
            ) : null}
            {permissions.peutSoumettre &&
            partenaire.cree_par_role === "ETABLISSEMENT" &&
            !partenaire.soumis_le &&
            !presenceVitrine ? (
              <button
                type="button"
                onClick={() => setActionWorkflow("soumettre")}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
              >
                <Send className="h-3.5 w-3.5" /> Soumettre
              </button>
            ) : null}
            {permissions.estPresidence &&
            (partenaire.soumis_le ||
              partenaire.cree_par_role === "PRESIDENCE") &&
            !presenceVitrine ? (
              <button
                type="button"
                onClick={() => setActionWorkflow("rendre-visible")}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-brand)]"
              >
                <Globe className="h-3.5 w-3.5" /> Rendre visible
              </button>
            ) : null}
            {permissions.estPresidence && presenceVitrine ? (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                <Check className="h-3.5 w-3.5" />
                {visibleSurVitrine
                  ? "Visible sur la vitrine"
                  : "Visibilité suspendue"}
              </span>
            ) : null}
            {permissions.peutArchiver ? (
              <button
                type="button"
                onClick={() => setDialogueArchivageOuvert(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--status-expire-fg)] hover:text-[var(--status-expire-fg)]"
              >
                <Archive className="h-3.5 w-3.5" /> Archiver
              </button>
            ) : null}
          </div>
        }
      />

      <p className="mb-4 text-xs font-medium text-[var(--color-text-secondary)]">
        Transmission :{" "}
        {partenaire.soumis_le
          ? "soumis à la Présidence"
          : partenaire.cree_par_role === "PRESIDENCE"
            ? "donnée de la Présidence"
            : "non soumis"}
        {" · "}
        Présence sur la vitrine :{" "}
        {visibleSurVitrine
          ? "visible"
          : presenceVitrine
            ? "suspendue car le partenaire n’est pas actif"
            : "privée"}
      </p>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader titre="Informations" sousTitre="Fiche du partenaire" />
          <PanelBody>
            {peutModifierPartenaire && editionEnCours ? (
              <PartenaireForm
                partenaire={partenaire}
                peutGererVisibilite={permissions.estPresidence}
                onAnnuler={() => navigate(`${cheminBase}/partenaires-partenariats/partenaires`)}
                onSoumettre={onSoumettre}
                enCours={enCoursMiseAJour}
              />
            ) : (
              <PartenaireInformations partenaire={partenaire} />
            )}
          </PanelBody>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader titre="Identité visuelle" />
            <PanelBody>
              <LogoUploader
                endpoint={`/partenaires/${partenaire.id}/logo`}
                logoUrl={partenaire.logo_url}
                nom={partenaire.nom}
                queryKeys={[
                  ["partenaires"],
                  ["partenaires", partenaire.id],
                  ["partenariats"],
                  ["projets"],
                  ["synthese"],
                  ["public"],
                  ["public-partenaires"],
                ]}
                lectureSeule={!peutModifierPartenaire}
              />
            </PanelBody>
          </Panel>
          <PartenaireCoordonnees partenaire={partenaire} />
          <ContactsSection
            partenaireId={partenaire.id}
            contacts={partenaire.contacts}
            peutGerer={peutModifierPartenaire}
          />
        </div>
      </div>

      {actionWorkflow ? (
        <ConfirmDialog
          ouvert
          onFermer={() => setActionWorkflow(null)}
          onConfirmer={confirmerWorkflow}
          titre={
            actionWorkflow === "soumettre"
              ? "Soumettre ce partenaire ?"
              : "Rendre ce partenaire visible ?"
          }
          description={
            actionWorkflow === "soumettre"
              ? "Le partenaire sera transmis à la Présidence et ne sera plus proposé à la soumission."
              : "Le partenaire actif apparaîtra sur la vitrine publique. Aucun contenu éditorial ne lui sera associé."
          }
          libelleAction={
            actionWorkflow === "soumettre" ? "Soumettre" : "Rendre visible"
          }
          enCours={
            actionWorkflow === "soumettre"
              ? soumission.isPending
              : miseEnVitrine.isPending
          }
        />
      ) : null}

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
