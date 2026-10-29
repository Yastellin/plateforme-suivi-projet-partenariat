// src/features/documents/components/DocumentDropzone.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUploadDocument } from "@/features/documents/api/useUploadDocument";
import type { TypeDocument } from "@/types/api";

export interface DocumentEnAttente {
  fichier: File;
  type: TypeDocument;
}

interface DocumentDropzoneProps {
  projetId?: string;
  conventionId?: string;
  cotutelleId?: string;
  partenariatId?: string;
  modePreparation?: boolean;
  onDocumentPret?: (document: DocumentEnAttente | null) => void;
}

const TYPES: { value: TypeDocument; label: string }[] = [
  { value: "TDR", label: "Termes de reference" },
  { value: "DESCRIPTION", label: "Description de projet" },
  { value: "CONVENTION", label: "Convention" },
  { value: "AUTRE", label: "Autre" },
];

export function DocumentDropzone({
  projetId,
  conventionId,
  cotutelleId,
  partenariatId,
  modePreparation = false,
  onDocumentPret,
}: DocumentDropzoneProps) {
  const [fichierSelectionne, setFichierSelectionne] = useState<File | null>(
    null,
  );
  const [type, setType] = useState<TypeDocument>("AUTRE");
  const [progression, setProgression] = useState(0);

  const upload = useUploadDocument(setProgression);

  const onDrop = useCallback((fichiersAcceptes: File[]) => {
    const fichier = fichiersAcceptes[0];
    if (!fichier) return;
    setFichierSelectionne(fichier);
    onDocumentPret?.({ fichier, type });
  }, [onDocumentPret, type]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: Boolean(fichierSelectionne),
    noKeyboard: Boolean(fichierSelectionne),
    onDropRejected: (rejets) => {
      const tailleDepassee = rejets.some((rejet) =>
        rejet.errors.some((erreur) => erreur.code === "file-too-large"),
      );
      toast.error(
        tailleDepassee
          ? "Le document ne doit pas dépasser 10 Mo."
          : "Choisissez un seul document PDF ou Word valide.",
      );
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  function retirerSelection() {
    setFichierSelectionne(null);
    onDocumentPret?.(null);
  }

  function changerType(nouveauType: TypeDocument) {
    setType(nouveauType);
    if (fichierSelectionne) {
      onDocumentPret?.({ fichier: fichierSelectionne, type: nouveauType });
    }
  }

  const handleEnvoyer = () => {
    if (modePreparation || !fichierSelectionne) return;

    upload.mutate(
      {
        fichier: fichierSelectionne,
        type,
        projet_id: projetId,
        convention_id: conventionId,
        cotutelle_id: cotutelleId,
        partenariat_id: partenariatId,
      },
      {
        onSuccess: () => {
          toast.success("Document televerse avec succes");
          retirerSelection();
          setProgression(0);
        },
        onError: (erreur) => toast.error(erreur.message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {!fichierSelectionne ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive ? "border-primary bg-accent" : "border-border"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Glissez un fichier ici, ou cliquez pour parcourir (PDF, Word)
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-md border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium">
                {fichierSelectionne.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input {...getInputProps({ className: "sr-only" })} />
              <Button type="button" variant="outline" size="sm" onClick={open} disabled={upload.isPending}>
                Remplacer
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Retirer le document sélectionné" onClick={retirerSelection} disabled={upload.isPending}>
                <X size={16} className="text-muted-foreground" />
              </Button>
            </div>
          </div>

          <Select
            value={type}
            onValueChange={(v) => changerType(v as TypeDocument)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {upload.isPending && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progression}%` }}
              />
            </div>
          )}

          {modePreparation ? (
            <p className="text-sm text-muted-foreground">
              Ce document sera téléversé après la création de l’entité.
            </p>
          ) : (
            <Button type="button" onClick={handleEnvoyer} disabled={upload.isPending}>
              {upload.isPending ? `Envoi... ${progression}%` : "Téléverser"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
