// src/features/publications/components/TeleversementPhotos.tsx
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Images, LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { useAjouterPhoto } from "@/features/publications/api/usePhotosPublication"

/** Depot de plusieurs images : chaque fichier est envoye a l'API. */
export function TeleversementPhotos({ publicationId }: { publicationId: string }) {
  const ajout = useAjouterPhoto(publicationId)
  const [enCours, setEnCours] = useState(0)

  const onDrop = useCallback(
    (fichiersAcceptes: File[]) => {
      if (fichiersAcceptes.length === 0) return

      setEnCours(fichiersAcceptes.length)

      fichiersAcceptes.forEach((fichier) => {
        ajout.mutate(
          { fichier },
          {
            onSuccess: () => toast.success(`${fichier.name} ajoutée`),
            onError: (erreur) => toast.error(`${fichier.name} : ${erreur.message}`),
            onSettled: () => setEnCours((n) => Math.max(0, n - 1)),
          },
        )
      })
    },
    [ajout],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
        isDragActive ? "border-primary bg-accent" : "border-border"
      }`}
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
            Glissez une ou plusieurs images ici, ou cliquez pour parcourir (JPEG, PNG, WebP)
          </p>
        </>
      )}
    </div>
  )
}
