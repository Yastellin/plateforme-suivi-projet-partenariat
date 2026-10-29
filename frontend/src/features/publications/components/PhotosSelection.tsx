// src/features/publications/components/PhotosSelection.tsx
import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageMedia } from "@/components/shared/ImageMedia";
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut";

const TAILLE_MAX_OCTETS = 5 * 1024 * 1024;
const NOMBRE_MAX_IMAGES = 20;

interface PhotosSelectionProps {
  fichiers: File[];
  onChange: (fichiers: File[]) => void;
  disabled?: boolean;
}

/** Sélection multiple d'images (JPEG, PNG, WebP, 5 Mo max chacune). */
export function PhotosSelection({
  fichiers,
  onChange,
  disabled = false,
}: PhotosSelectionProps) {
  const onDrop = useCallback(
    (acceptes: File[]) => {
      const placesDisponibles = Math.max(
        0,
        NOMBRE_MAX_IMAGES - fichiers.length,
      );
      if (acceptes.length > placesDisponibles) {
        toast.error(
          `Sélectionnez au maximum ${NOMBRE_MAX_IMAGES} images avant de créer la publication.`,
        );
      }
      if (placesDisponibles > 0) {
        onChange([...fichiers, ...acceptes.slice(0, placesDisponibles)]);
      }
    },
    [fichiers, onChange],
  );

  const apercus = useMemo(
    () => fichiers.map((fichier) => URL.createObjectURL(fichier)),
    [fichiers],
  );
  useEffect(
    () => () => apercus.forEach((url) => URL.revokeObjectURL(url)),
    [apercus],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      disabled,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      maxSize: TAILLE_MAX_OCTETS,
      maxFiles: NOMBRE_MAX_IMAGES,
    });

  const retirer = (index: number) => {
    onChange(fichiers.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive ? "border-primary bg-accent" : "border-border"
        } ${disabled ? "opacity-50" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />
        <ImagePlus size={28} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Glissez une ou plusieurs images ici, ou cliquez pour parcourir (JPEG,
          PNG, WebP — 5 Mo max chacune)
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p className="text-sm text-destructive">
          {fileRejections.some((rejet) =>
            rejet.errors.some((erreur) => erreur.code === "too-many-files"),
          )
            ? `Sélectionnez au maximum ${NOMBRE_MAX_IMAGES} images à la fois.`
            : "Certaines images ont été refusées (format ou taille non valide)."}
        </p>
      )}

      {fichiers.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fichiers.map((fichier, index) => (
            <li
              key={`${fichier.name}-${index}`}
              className="flex flex-col gap-1"
            >
              <ImageMedia
                src={apercus[index]}
                alt={fichier.name}
                className="h-28 w-full rounded-md object-cover"
                resoudre={false}
                fallback={<ImageDefaut alt="" className="h-28 w-full rounded-md object-cover" />}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {fichier.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => retirer(index)}
                  disabled={disabled}
                  aria-label={`Retirer ${fichier.name}`}
                >
                  <X size={14} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
