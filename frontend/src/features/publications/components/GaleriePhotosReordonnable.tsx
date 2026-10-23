// src/features/publications/components/GaleriePhotosReordonnable.tsx
import { useState } from "react"
import { Reorder } from "framer-motion"
import { GripVertical, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSupprimerPhoto } from "@/features/publications/api/usePhotosPublication"
import { ImageMedia } from "@/components/shared/ImageMedia"
import type { PhotoPublication } from "@/types/api"

export function GaleriePhotosReordonnable({
  photos,
}: {
  photos: PhotoPublication[]
}) {
  const [ordre, setOrdre] = useState(photos)
  const suppression = useSupprimerPhoto()

  return (
    <Reorder.Group axis="y" values={ordre} onReorder={setOrdre} className="flex flex-col gap-2">
      {ordre.map((photo) => (
        <Reorder.Item
          key={photo.id}
          value={photo}
          className="flex items-center gap-3 rounded-md border border-border bg-card p-2"
        >
          <GripVertical size={16} className="cursor-grab text-muted-foreground" />
          <ImageMedia
            src={photo.url_fichier}
            alt={photo.legende ?? "Photo de la publication"}
            className="h-14 w-14 flex-shrink-0 rounded object-cover"
            loading="lazy"
          />
          <Input
            defaultValue={photo.legende ?? ""}
            placeholder="Legende (optionnelle)"
            className="flex-1"
          />
          <button onClick={() => suppression.mutate(photo.id)} disabled={suppression.isPending}>
            <X size={16} className="text-muted-foreground hover:text-destructive" />
          </button>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}