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
  onDocumentPret?: (documents: DocumentEnAttente[]) => void;
}

const NOMBRE_MAXIMUM_FICHIERS = 10;

const TYPES: { value: TypeDocument; label: string }[] = [
  { value: "TDR", label: "Termes de référence" },
  { value: "DESCRIPTION", label: "Description de projet" },
  { value: "CONVENTION", label: "Convention" },
  { value: "AUTRE", label: "Autre" },
];

function cleFichier(fichier: File): string {
  return `${fichier.name}:${fichier.size}:${fichier.lastModified}`;
}

export function DocumentDropzone({
  projetId,
  conventionId,
  cotutelleId,
  partenariatId,
  modePreparation = false,
  onDocumentPret,
}: DocumentDropzoneProps) {
  const [documentsSelectionnes, setDocumentsSelectionnes] = useState<DocumentEnAttente[]>([]);
  const [progression, setProgression] = useState(0);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const upload = useUploadDocument(setProgression);

  const onDrop = useCallback((fichiersAcceptes: File[]) => {
    const nomsExistants = new Set(documentsSelectionnes.map(({ fichier }) => fichier.name.toLocaleLowerCase()));
    const fichiersAjoutes: File[] = [];
    let nomsDejaSelectionnes = 0;
    for (const fichier of fichiersAcceptes) {
      const nomNormalise = fichier.name.toLocaleLowerCase();
      if (nomsExistants.has(nomNormalise)) {
        nomsDejaSelectionnes += 1;
      } else {
        nomsExistants.add(nomNormalise);
        fichiersAjoutes.push(fichier);
      }
    }
    const placeDisponible = NOMBRE_MAXIMUM_FICHIERS - documentsSelectionnes.length;
    const fichiersRetenus = fichiersAjoutes.slice(0, placeDisponible);
    const documentsActualises = [
      ...documentsSelectionnes,
      ...fichiersRetenus.map((fichier) => ({ fichier, type: "AUTRE" as TypeDocument })),
    ];

    if (fichiersAjoutes.length > fichiersRetenus.length) {
      toast.warning(`Vous pouvez sélectionner jusqu’à ${NOMBRE_MAXIMUM_FICHIERS} documents.`);
    }
    if (nomsDejaSelectionnes > 0) {
      toast.warning("Un document portant le même nom est déjà sélectionné. Renommez le fichier avant de l’ajouter.");
    }

    setDocumentsSelectionnes(documentsActualises);
    onDocumentPret?.(documentsActualises);
  }, [documentsSelectionnes, onDocumentPret]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: documentsSelectionnes.length > 0,
    noKeyboard: documentsSelectionnes.length > 0,
    multiple: true,
    maxFiles: NOMBRE_MAXIMUM_FICHIERS,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    onDropRejected: (rejets) => {
      const tailleDepassee = rejets.some((rejet) =>
        rejet.errors.some((erreur) => erreur.code === "file-too-large"),
      );
      const tropDeFichiers = rejets.some((rejet) =>
        rejet.errors.some((erreur) => erreur.code === "too-many-files"),
      );
      toast.error(
        tailleDepassee
          ? "Chaque document ne doit pas dépasser 10 Mo."
          : tropDeFichiers
            ? `Vous pouvez sélectionner jusqu’à ${NOMBRE_MAXIMUM_FICHIERS} documents à la fois.`
            : "Choisissez des documents PDF, DOC ou DOCX valides.",
      );
    },
  });

  function retirerDocument(index: number) {
    const documentsActualises = documentsSelectionnes.filter((_, indexDocument) => indexDocument !== index);
    setDocumentsSelectionnes(documentsActualises);
    onDocumentPret?.(documentsActualises);
  }

  function changerType(index: number, nouveauType: TypeDocument) {
    const documentsActualises = documentsSelectionnes.map((document, indexDocument) =>
      indexDocument === index ? { ...document, type: nouveauType } : document,
    );
    setDocumentsSelectionnes(documentsActualises);
    onDocumentPret?.(documentsActualises);
  }

  async function handleEnvoyer() {
    if (modePreparation || documentsSelectionnes.length === 0 || envoiEnCours) return;

    setEnvoiEnCours(true);
    const documentsEnErreur: DocumentEnAttente[] = [];

    for (const document of documentsSelectionnes) {
      try {
        await upload.mutateAsync({
          fichier: document.fichier,
          type: document.type,
          projet_id: projetId,
          convention_id: conventionId,
          cotutelle_id: cotutelleId,
          partenariat_id: partenariatId,
        });
      } catch {
        documentsEnErreur.push(document);
      }
    }

    setDocumentsSelectionnes(documentsEnErreur);
    onDocumentPret?.(documentsEnErreur);
    setProgression(0);
    setEnvoiEnCours(false);

    if (documentsEnErreur.length === 0) {
      toast.success(
        documentsSelectionnes.length === 1
          ? "Document téléversé avec succès."
          : "Documents téléversés avec succès.",
      );
    } else {
      const nombreTeleverse = documentsSelectionnes.length - documentsEnErreur.length;
      if (nombreTeleverse > 0) {
        toast.success(`${nombreTeleverse} document${nombreTeleverse > 1 ? "s" : ""} téléversé${nombreTeleverse > 1 ? "s" : ""}.`);
      }
      toast.error(
        `${documentsEnErreur.length} document${documentsEnErreur.length > 1 ? "s n’ont" : " n’a"} pas pu être téléversé${documentsEnErreur.length > 1 ? "s" : ""}. Vous pouvez réessayer.`,
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {documentsSelectionnes.length === 0 ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive ? "border-primary bg-accent" : "border-border"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Glissez des documents ici ou cliquez pour parcourir (PDF, DOC ou DOCX, 10 Mo maximum par document).
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-md border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {documentsSelectionnes.length} document{documentsSelectionnes.length > 1 ? "s" : ""} sélectionné{documentsSelectionnes.length > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <input {...getInputProps({ className: "sr-only" })} />
              <Button type="button" variant="outline" size="sm" onClick={open} disabled={envoiEnCours}>
                Ajouter des documents
              </Button>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {documentsSelectionnes.map((document, index) => (
              <li key={cleFichier(document.fichier)} className="grid grid-cols-1 items-center gap-3 rounded-md bg-muted/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.7fr)_auto]">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText size={18} className="shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium" title={document.fichier.name}>
                    {document.fichier.name}
                  </span>
                </div>
                <Select
                  value={document.type}
                  onValueChange={(valeur) => changerType(index, valeur as TypeDocument)}
                  disabled={envoiEnCours}
                >
                  <SelectTrigger aria-label={`Type du document ${document.fichier.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((typeDocument) => (
                      <SelectItem key={typeDocument.value} value={typeDocument.value}>
                        {typeDocument.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Retirer ${document.fichier.name}`}
                  onClick={() => retirerDocument(index)}
                  disabled={envoiEnCours}
                >
                  <X size={16} className="text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>

          {envoiEnCours && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progression}%` }}
              />
            </div>
          )}

          {modePreparation ? (
            <p className="text-sm text-muted-foreground">
              Ces documents seront téléversés après la création de l’entité.
            </p>
          ) : (
            <Button type="button" onClick={handleEnvoyer} disabled={envoiEnCours}>
              {envoiEnCours
                ? `Téléversement en cours… ${progression}%`
                : `Téléverser ${documentsSelectionnes.length === 1 ? "le document" : "les documents"}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
