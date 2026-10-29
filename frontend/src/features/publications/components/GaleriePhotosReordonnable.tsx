// src/features/publications/components/GaleriePhotosReordonnable.tsx
import { useState } from "react"
import { Reorder } from "framer-motion"
import { GripVertical, LoaderCircle, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import {
  useModifierPhoto,
  useSupprimerPhoto,
} from "@/features/publications/api/usePhotosPublication"
import { ImageMedia } from "@/components/shared/ImageMedia"
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut"
import type { PhotoPublication } from "@/types/api"

function trierPhotos(photos: PhotoPublication[]): PhotoPublication[] {
  return [...photos].sort((a, b) => a.ordre - b.ordre)
}

export function GaleriePhotosReordonnable({
  photos,
}: {
  photos: PhotoPublication[]
}) {
  const [photosEditees, setPhotosEditees] = useState(() => trierPhotos(photos))
  const [ordreModifie, setOrdreModifie] = useState(false)
  const modification = useModifierPhoto()
  const suppression = useSupprimerPhoto()

  function modifierLocalement(
    id: string,
    changements: Partial<Pick<PhotoPublication, "legende" | "ordre">>,
  ) {
    setPhotosEditees((courantes) =>
      courantes.map((photo) =>
        photo.id === id ? { ...photo, ...changements } : photo,
      ),
    )
  }

  async function enregistrerPhoto(photo: PhotoPublication) {
    try {
      await modification.mutateAsync({
        photoId: photo.id,
        valeurs: {
          legende: photo.legende?.trim() || null,
          ordre: photo.ordre,
        },
      })
      toast.success("Légende et ordre enregistrés")
    } catch (erreur) {
      toast.error(
        erreur instanceof Error
          ? erreur.message
          : "Les informations de la photo n'ont pas pu être enregistrées.",
      )
    }
  }

  async function enregistrerOrdre() {
    const ordreCourant = photosEditees.map((photo, index) => ({
      ...photo,
      ordre: index,
    }))
    setPhotosEditees(ordreCourant)

    try {
      for (const photo of ordreCourant) {
        await modification.mutateAsync({
          photoId: photo.id,
          valeurs: { ordre: photo.ordre },
        })
      }
      setOrdreModifie(false)
      toast.success("Ordre des photos enregistré")
    } catch (erreur) {
      toast.error(
        erreur instanceof Error
          ? erreur.message
          : "L'ordre des photos n'a pas pu être enregistré.",
      )
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        La légende est facultative. Faites glisser les photos ou saisissez leur
        ordre, puis enregistrez vos changements.
      </p>
      <Reorder.Group
        axis="y"
        values={photosEditees}
        onReorder={(nouvelOrdre) => {
          setPhotosEditees(
            nouvelOrdre.map((photo, index) => ({ ...photo, ordre: index })),
          )
          setOrdreModifie(true)
        }}
        className="flex flex-col gap-2"
      >
        {photosEditees.map((photo) => (
          <Reorder.Item
            key={photo.id}
            value={photo}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center"
          >
            <GripVertical
              size={18}
              className="hidden flex-shrink-0 cursor-grab text-muted-foreground sm:block"
              aria-label="Déplacer la photo"
            />
            <ImageMedia
              src={photo.url_fichier}
              alt={photo.legende || "Photo de la publication"}
              className="h-20 w-full flex-shrink-0 rounded object-cover sm:h-16 sm:w-20"
              loading="lazy"
              fallback={(
                <ImageDefaut
                  alt=""
                  className="h-20 w-full flex-shrink-0 rounded object-cover sm:h-16 sm:w-20"
                />
              )}
            />
            <label className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">
              Légende facultative
              <Input
                value={photo.legende ?? ""}
                onChange={(event) =>
                  modifierLocalement(photo.id, { legende: event.target.value })
                }
                placeholder="Ex. Atelier avec les chercheurs de l'Université de Mahajanga"
                className="mt-1"
                maxLength={255}
              />
            </label>
            <label className="w-full text-xs font-medium text-muted-foreground sm:w-24">
              Ordre
              <Input
                type="number"
                min={0}
                step={1}
                value={photo.ordre}
                onChange={(event) => {
                  const valeur = Math.max(0, Number(event.target.value) || 0)
                  modifierLocalement(photo.id, { ordre: valeur })
                }}
                className="mt-1"
              />
            </label>
            <div className="flex items-center gap-1 self-end sm:self-center">
              <button
                type="button"
                onClick={() => void enregistrerPhoto(photo)}
                disabled={modification.isPending}
                aria-label={`Enregistrer les informations de la photo ${photo.ordre + 1}`}
                title="Enregistrer la légende et l'ordre"
                className="rounded p-2 text-[var(--color-brand)] hover:bg-accent disabled:opacity-50"
              >
                {modification.isPending ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
              </button>
              <button
                type="button"
                onClick={() => suppression.mutate(photo.id)}
                disabled={suppression.isPending}
                aria-label={`Supprimer la photo ${photo.ordre + 1}`}
                title="Supprimer la photo"
                className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {ordreModifie ? (
        <button
          type="button"
          onClick={() => void enregistrerOrdre()}
          disabled={modification.isPending}
          className="inline-flex items-center gap-2 self-start rounded-md border border-[var(--color-brand)] px-3 py-2 text-xs font-semibold text-[var(--color-brand)] disabled:opacity-50"
        >
          {modification.isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer le nouvel ordre
        </button>
      ) : null}
    </div>
  )
}
