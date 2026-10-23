// src/features/publications/components/TeleversementPhotos.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Images, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { useAjouterPhoto } from "@/features/publications/api/usePhotosPublication";

/** Depot de plusieurs images : chaque fichier est envoye a l'API. */
export function TeleversementPhotos({
  publicationId,
}: {
  publicationId: string;
}) {
  const ajout = useAjouterPhoto(publicationId);
  const [enCours, setEnCours] = useState(0);

  const onDrop = useCallback(
    async (fichiersAcceptes: File[]) => {
      if (fichiersAcceptes.length === 0) return;

      setEnCours(fichiersAcceptes.length);
      // Une file séquentielle garantit un retour par fichier. Les callbacks
      // passés à plusieurs appels `mutate` consécutifs ne sont sinon garantis
      // que pour le dernier observateur TanStack Query.
      for (const fichier of fichiersAcceptes) {
        try {
          await ajout.mutateAsync({ fichier });
          toast.success(`${fichier.name} ajoutée`);
        } catch (erreur) {
          toast.error(
            `${fichier.name} : ${erreur instanceof Error ? erreur.message : "échec de l'envoi"}`,
          );
        } finally {
          setEnCours((nombre) => Math.max(0, nombre - 1));
        }
      }
    },
    [ajout],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejets) => {
      const codes = rejets.flatMap((rejet) =>
        rejet.errors.map((erreur) => erreur.code),
      );
      toast.error(
        codes.includes("file-too-large")
          ? "Chaque image doit peser au maximum 5 Mo."
          : codes.includes("too-many-files")
            ? "Sélectionnez au maximum 20 images à la fois."
            : "Choisissez uniquement des images JPEG, PNG ou WebP valides.",
      );
    },
    multiple: true,
    maxFiles: 20,
    maxSize: 5 * 1024 * 1024,
    disabled: enCours > 0,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
        isDragActive ? "border-primary bg-accent" : "border-border"
      } ${enCours > 0 ? "cursor-wait opacity-60" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      {enCours > 0 ? (
        <>
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Envoi de {enCours} image{enCours > 1 ? "s" : ""}...
          </p>
        </>
      ) : (
        <>
          <Images size={28} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Glissez une ou plusieurs images ici, ou cliquez pour parcourir
            (JPEG, PNG, WebP)
          </p>
        </>
      )}
    </div>
  );
}
