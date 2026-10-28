import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { LoaderCircle, ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import type { Publication } from "@/types/api"
import {
  useSupprimerImageCouverture,
  useTeleverserImageCouverture,
} from "@/features/publications/api/useImageCouverturePublication"

const TYPES_IMAGE_AUTORISES = ["image/jpeg", "image/png", "image/webp"]
const TAILLE_MAXIMALE = 5 * 1024 * 1024

export function ImageCouvertureEditeur({
  publication,
  projetId,
}: {
  publication: Publication
  projetId: string
}) {
  const entreeFichier = useRef<HTMLInputElement>(null)
  const [apercuLocal, setApercuLocal] = useState<string | null>(null)
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)
  const televersement = useTeleverserImageCouverture(publication.id, projetId)
  const suppression = useSupprimerImageCouverture(publication.id, projetId)
  const imageAffichee = apercuLocal ?? publication.image_couverture_url ?? null
  const enCours = televersement.isPending || suppression.isPending

  useEffect(() => {
    if (!apercuLocal?.startsWith("blob:")) return
    return () => URL.revokeObjectURL(apercuLocal)
  }, [apercuLocal])

  function choisirFichier(event: ChangeEvent<HTMLInputElement>) {
    const fichier = event.target.files?.[0]
    event.target.value = ""
    if (!fichier) return
    if (!TYPES_IMAGE_AUTORISES.includes(fichier.type)) {
      toast.error("Choisissez une image JPEG, PNG ou WebP.")
      return
    }
    if (fichier.size > TAILLE_MAXIMALE) {
      toast.error("L’image doit peser au maximum 5 Mo.")
      return
    }

    setApercuLocal(URL.createObjectURL(fichier))
    televersement.mutate(fichier, {
      onSuccess: () => {
        setApercuLocal(null)
        toast.success("Image de couverture mise à jour.")
      },
      onError: (erreur) => {
        setApercuLocal(null)
        toast.error(erreur instanceof Error ? erreur.message : "Échec du téléversement.")
      },
    })
  }

  function supprimer() {
    suppression.mutate(undefined, {
      onSuccess: () => {
        setConfirmationOuverte(false)
        setApercuLocal(null)
        toast.success("Image de couverture supprimée.")
      },
      onError: (erreur) => {
        toast.error(erreur instanceof Error ? erreur.message : "Échec de la suppression.")
      },
    })
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="titre-image-couverture" aria-busy={enCours}>
      <div>
        <h3 id="titre-image-couverture" className="font-heading text-sm font-semibold">
          Image de couverture
        </h3>
        <p className="text-sm text-muted-foreground">
          Image principale de l’actualité, indépendante des photos illustratives.
          Formats JPEG, PNG ou WebP, 5 Mo maximum.
        </p>
      </div>

      {imageAffichee && (
        <img
          src={imageAffichee}
          alt={`Aperçu de l’image de couverture de ${publication.titre}`}
          className="aspect-[16/7] w-full max-w-2xl rounded-md border object-cover"
        />
      )}

      <input
        ref={entreeFichier}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Choisir une image de couverture"
        onChange={choisirFichier}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => entreeFichier.current?.click()}
          disabled={enCours}
        >
          {televersement.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {publication.image_couverture_url ? "Remplacer" : "Ajouter une couverture"}
        </Button>
        {publication.image_couverture_url && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmationOuverte(true)}
            disabled={enCours}
          >
            <Trash2 aria-hidden="true" /> Supprimer
          </Button>
        )}
      </div>

      <ConfirmDialog
        ouvert={confirmationOuverte}
        onFermer={() => setConfirmationOuverte(false)}
        titre="Supprimer l’image de couverture ?"
        description="Cette action supprime la couverture, sans toucher aux photos illustratives."
        libelleAction="Supprimer"
        destructif
        enCours={suppression.isPending}
        onConfirmer={supprimer}
      />
    </section>
  )
}
