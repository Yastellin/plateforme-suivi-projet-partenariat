// src/components/shared/Dropzone.tsx
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { CloudUpload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageMedia } from "@/components/shared/ImageMedia"
import { cn } from "@/lib/utils"

interface DropzoneProps {
  onFichierSelectionne: (fichier: File) => void
  accepte?: Record<string, string[]>
  maxTailleMo?: number
  libelle?: string
  urlApercu?: string
  className?: string
  disabled?: boolean
}

// Zone de glisser-deposer + clic (section 8), utilisee pour les logos,
// documents et photos, avec apercu avant envoi.
export function Dropzone({
  onFichierSelectionne,
  accepte,
  maxTailleMo = 5,
  libelle = "Glissez un fichier ici, ou cliquez pour parcourir",
  urlApercu,
  className,
  disabled,
}: DropzoneProps) {
  const [erreur, setErreur] = useState<string | null>(null)
  const [apercu, setApercu] = useState<string | undefined>(urlApercu)

  const onDrop = useCallback(
    (fichiersAcceptes: File[]) => {
      setErreur(null)
      const fichier = fichiersAcceptes[0]
      if (!fichier) return
      const url = URL.createObjectURL(fichier)
      setApercu(url)
      onFichierSelectionne(fichier)
    },
    [onFichierSelectionne]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accepte,
    multiple: false,
    disabled,
    maxSize: maxTailleMo * 1024 * 1024,
    onDropRejected: (rejets) => {
      const rejet = rejets[0]
      if (rejet.errors.some((e) => e.code === "file-too-large")) {
        setErreur(`Le fichier depasse la taille maximale de ${maxTailleMo} Mo`)
      } else {
        setErreur("Type de fichier non accepte")
      }
    },
  })

  return (
    <div className="flex flex-col gap-2">
      {apercu ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <ImageMedia
            src={apercu}
            alt="Aperçu du fichier"
            className="size-16 rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground"
            onClick={() => {
              setApercu(undefined)
              setErreur(null)
            }}
            disabled={disabled}
          >
            <X />
            Retirer
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex min-h-24 min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors",
            "hover:border-primary/50 hover:bg-muted/50",
            isDragActive && "border-primary bg-accent/50 text-accent-foreground",
            className
          )}
        >
          <input {...getInputProps()} />
          <CloudUpload size={20} />
          <span>{libelle}</span>
        </div>
      )}
      {erreur && <p className="text-sm text-destructive">{erreur}</p>}
    </div>
  )
}
