// src/features/documents/components/ListeDocumentsEntite.tsx
import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDocumentsEntite } from "@/features/documents/api/useDocumentsEntite";
import { useTelechargerDocument } from "@/features/documents/api/useTelechargerDocument";
import { formaterDate } from "@/lib/format";
import type { DocumentFichier, TypeDocument } from "@/types/api";

const LIBELLES_TYPE: Record<TypeDocument, string> = {
  TDR: "Termes de référence",
  DESCRIPTION: "Description de projet",
  CONVENTION: "Convention",
  AUTRE: "Autre",
};

interface Props {
  projetId?: string;
  conventionId?: string;
  cotutelleId?: string;
  partenariatId?: string;
}

/** Dernière version active des documents rattachés à une entité métier. */
export function ListeDocumentsEntite({
  projetId,
  conventionId,
  cotutelleId,
  partenariatId,
}: Props) {
  const {
    data: documents,
    isLoading,
    isError,
    error,
  } = useDocumentsEntite({
    projet_id: projetId,
    convention_id: conventionId,
    cotutelle_id: cotutelleId,
    partenariat_id: partenariatId,
  });
  const telechargement = useTelechargerDocument();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  // Le contrat API reste la source d'autorisation ; une réponse refusée est
  // affichée explicitement plutôt que présentée comme une liste vide.
  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        {error?.message ?? "Impossible de charger les documents."}
      </p>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icone={FileText}
        titre="Aucun document"
        description="Aucun document n'a encore été téléversé."
      />
    );
  }

  const types = [...new Set(documents.map((d) => d.type))];

  return (
    <div className="flex flex-col gap-4">
      {types.map((type) => (
        <div key={type} className="flex flex-col gap-2">
          <h4 className="font-heading text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            {LIBELLES_TYPE[type] ?? type}
          </h4>
          {documents
            .filter((d) => d.type === type)
            .sort((a, b) => b.version - a.version)
            .map((document) => (
              <LigneDocument
                key={document.id}
                document={document}
                onTelecharger={() =>
                  telechargement.mutate({
                    id: document.id,
                    nomFichier: document.nom_fichier,
                  })
                }
              />
            ))}
        </div>
      ))}
    </div>
  );
}

function LigneDocument({
  document,
  onTelecharger,
}: {
  document: DocumentFichier;
  onTelecharger: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{document.nom_fichier}</p>
          <p className="text-xs text-muted-foreground">
            Version {document.version} · {formaterDate(document.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {document.est_archive ? (
          <Badge variant="outline">Archivée</Badge>
        ) : (
          <Badge variant="secondary">Courante</Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onTelecharger}
          aria-label={`Télécharger ${document.nom_fichier}`}
          title={`Télécharger ${document.nom_fichier}`}
        >
          <Download size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
