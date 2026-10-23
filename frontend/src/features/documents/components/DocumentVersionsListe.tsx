// src/features/documents/components/DocumentVersionsListe.tsx
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useVersionsDocument } from "@/features/documents/api/useVersionsDocument";
import { useTelechargerDocument } from "@/features/documents/api/useTelechargerDocument";

export function DocumentVersionsListe({ documentId }: { documentId: string }) {
  const { data: versions, isLoading } = useVersionsDocument(documentId);
  const telechargement = useTelechargerDocument();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (!versions || versions.length === 0) {
    return (
      <EmptyState
        icone={FileText}
        titre="Aucun document"
        description="Aucun document n'a encore ete televerse."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {[...versions]
        .sort((a, b) => b.version - a.version)
        .map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-md border border-border p-3"
          >
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{doc.nom_fichier}</p>
                <p className="text-xs text-muted-foreground">
                  Version {doc.version} {doc.est_archive && "(archivee)"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                telechargement.mutate({
                  id: doc.id,
                  nomFichier: doc.nom_fichier,
                  archive: doc.est_archive,
                })
              }
            >
              <Download size={16} />
            </Button>
          </div>
        ))}
    </div>
  );
}
