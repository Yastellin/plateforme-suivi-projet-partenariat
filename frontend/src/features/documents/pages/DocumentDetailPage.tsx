// src/features/documents/pages/DocumentDetailPage.tsx

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Archive, FileText, Download } from "lucide-react";
import { toast } from "sonner";

import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { formaterDate } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { DocumentVersionsListe } from "@/features/documents/components/DocumentVersionsListe";
import type { DocumentFichier } from "@/types/api";
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext";
import { useTelechargerDocument } from "@/features/documents/api/useTelechargerDocument";
import { useArchiverDocument } from "@/features/documents/api/useArchiverDocument";

function Champ({
  libelle,
  valeur,
}: {
  libelle: string;
  valeur?: string | null;
}) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {libelle}
      </dt>
      <dd className="mt-1 font-mono text-[12.5px]">{valeur || "—"}</dd>
    </div>
  );
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const telechargement = useTelechargerDocument();
  const archivage = useArchiverDocument();
  const [confirmationOuverte, setConfirmationOuverte] = useState(false);

  const role = utilisateur?.role;
  const cheminBase =
    role === "PRESIDENCE"
      ? "/presidence"
      : role === "ETABLISSEMENT"
        ? "/etablissement"
        : "/decideur";

  const { data: document, isLoading } = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const reponse = await apiClient.get<DocumentFichier>(`/documents/${id}`);
      return reponse.data;
    },
    enabled: Boolean(id),
  });
  useTitreBreadcrumb(document?.nom_fichier);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  if (!document) {
    return (
      <EmptyState
        icone={FileText}
        titre="Document introuvable"
        description="Ce document n'existe pas ou a été supprimé."
      />
    );
  }

  return (
    <div>
      <PageHeader
        titre={document.nom_fichier}
        description={`Version ${document.version}`}
        badge={<Badge variant="outline">{document.type}</Badge>}
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                telechargement.mutate({
                  id: document.id,
                  nomFichier: document.nom_fichier,
                })
              }
              disabled={telechargement.isPending}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {telechargement.isPending ? "Téléchargement…" : "Télécharger"}
            </button>
            {permissions.peutArchiver ? (
              <button
                type="button"
                onClick={() => setConfirmationOuverte(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--status-expire-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--status-expire-fg)] hover:bg-[var(--status-expire-bg)]"
              >
                <Archive className="h-3.5 w-3.5" />
                Archiver
              </button>
            ) : null}
          </>
        }
      />

      <div className="mb-[22px] grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader titre="Informations" />
          <PanelBody>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Champ
                libelle="Date de création"
                valeur={formaterDate(document.created_at)}
              />
              <Champ
                libelle="Dernière modification"
                valeur={formaterDate(document.updated_at)}
              />
              <Champ libelle="Type" valeur={document.type} />
              <Champ libelle="Version" valeur={`v${document.version}`} />
            </dl>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader titre="Historique des versions" />
          <PanelBody>
            <DocumentVersionsListe documentId={document.id} />
          </PanelBody>
        </Panel>
      </div>

      {document.projet_id && (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Document lié au{" "}
          <Link
            to={`${cheminBase}/projets/${document.projet_id}`}
            className="font-semibold text-[var(--color-brand)] hover:underline"
          >
            projet associé
          </Link>
        </p>
      )}
      {document.convention_id && (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Document lié à la{" "}
          <Link
            to={`${cheminBase}/conventions/${document.convention_id}`}
            className="font-semibold text-[var(--color-brand)] hover:underline"
          >
            convention associée
          </Link>
        </p>
      )}
      {document.cotutelle_id && (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Document lié à la{" "}
          <Link
            to={`${cheminBase}/cotutelles/${document.cotutelle_id}`}
            className="font-semibold text-[var(--color-brand)] hover:underline"
          >
            cotutelle associée
          </Link>
        </p>
      )}
      {document.partenariat_id && (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Document lié au{" "}
          <Link
            to={`${cheminBase}/partenaires-partenariats/partenariats/${document.partenariat_id}`}
            className="font-semibold text-[var(--color-brand)] hover:underline"
          >
            partenariat associé
          </Link>
        </p>
      )}

      {permissions.peutArchiver ? (
        <DestructiveConfirmDialog
          ouvert={confirmationOuverte}
          onFermer={() => setConfirmationOuverte(false)}
          onConfirmer={() =>
            archivage.mutate(document.id, {
              onSuccess: () => {
                toast.success("Document archivé");
                setConfirmationOuverte(false);
                navigate(`${cheminBase}/documents`);
              },
              onError: (erreur) => toast.error(erreur.message),
            })
          }
          titre="Archiver ce document ?"
          description="Le fichier restera conservé et pourra être consulté ou restauré depuis les archives."
          nomCible={document.nom_fichier}
          libelleAction="Archiver"
          enCours={archivage.isPending}
        />
      ) : null}
    </div>
  );
}
