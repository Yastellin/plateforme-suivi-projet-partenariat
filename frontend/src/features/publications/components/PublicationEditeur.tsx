// src/features/publications/components/PublicationEditeur.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { LoaderCircle, Globe } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { obtenirInfoStatut } from "@/lib/status-mappings"
import { GaleriePhotosReordonnable } from "@/features/publications/components/GaleriePhotosReordonnable"
import { TeleversementPhotos } from "@/features/publications/components/TeleversementPhotos"
import { PhotosSelection } from "@/features/publications/components/PhotosSelection"
import { schemaPublication, type PublicationFormValues } from "@/lib/validators/publication.schema"
import { usePublication } from "@/features/publications/api/usePublication"
import { useCreatePublication } from "@/features/publications/api/useCreatePublication"
import { useUpdatePublication } from "@/features/publications/api/useUpdatePublication"
import { usePublierPublication } from "@/features/publications/api/usePublierPublication"
import { ajouterPhoto } from "@/features/publications/api/usePhotosPublication"

export function PublicationEditeur({ projetId }: { projetId: string }) {
  const [confirmPublierOuvert, setConfirmPublierOuvert] = useState(false)
  const [photosSelectionnees, setPhotosSelectionnees] = useState<File[]>([])
  const [envoiPhotos, setEnvoiPhotos] = useState(false)
  const { data: publication, isLoading } = usePublication(projetId)
  const queryClient = useQueryClient()

  const creation = useCreatePublication(projetId)
  const modification = useUpdatePublication(publication?.id ?? "", projetId)
  const publierAction = usePublierPublication(publication?.id ?? "", projetId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(schemaPublication),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      titre: publication?.titre ?? "",
      description_publique: publication?.description_publique ?? "",
      resultats: publication?.resultats ?? "",
    },
  })

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  const onSubmit = async (valeurs: PublicationFormValues) => {
    if (publication) {
      modification.mutate(valeurs, { onSuccess: () => toast.success("Publication mise a jour") })
      return
    }

    try {
      const nouvelle = await creation.mutateAsync(valeurs)
      if (photosSelectionnees.length > 0) {
        setEnvoiPhotos(true)
        try {
          // Envoi une à une ; les photos déjà envoyées sont retirées de la sélection.
          for (const fichier of [...photosSelectionnees]) {
            await ajouterPhoto(nouvelle.id, fichier)
            setPhotosSelectionnees((courantes) => courantes.filter((f) => f !== fichier))
          }
        } finally {
          setEnvoiPhotos(false)
          queryClient.invalidateQueries({ queryKey: ["publications"] })
        }
      }
      toast.success("Publication créée")
    } catch (erreur) {
      toast.error(erreur instanceof Error ? erreur.message : "Une erreur est survenue")
    }
  }

  const enCours = creation.isPending || modification.isPending || envoiPhotos

  return (
    <div className="flex flex-col gap-6">
      {publication && (
        <div className="flex items-center justify-between">
          <StatusBadge libelle={obtenirInfoStatut(publication.statut).libelle} tonalite={obtenirInfoStatut(publication.statut).tonalite} />
          {publication.statut === "BROUILLON" && (
            <Button variant="outline" onClick={() => setConfirmPublierOuvert(true)}>
              <Globe size={16} /> Publier
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titre" requis>Titre</Label>
          <Input id="titre" aria-invalid={!!errors.titre} {...register("titre")} />
          {errors.titre && <p className="text-sm text-destructive">{errors.titre.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description_publique">Description publique</Label>
          <Textarea id="description_publique" {...register("description_publique")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resultats">Resultats</Label>
          <Textarea id="resultats" {...register("resultats")} />
        </div>

        {!publication && (
          <div className="flex flex-col gap-1.5">
            <Label>Images (plusieurs possibles)</Label>
            <PhotosSelection fichiers={photosSelectionnees} onChange={setPhotosSelectionnees} disabled={enCours} />
          </div>
        )}

        <Button type="submit" disabled={enCours} className="self-start">
          {enCours && <LoaderCircle className="animate-spin" />}
          {publication ? "Enregistrer" : "Créer la publication"}
        </Button>
      </form>

      {publication && (
        <div>
          <h3 className="mb-2 font-heading text-sm font-semibold">Photos</h3>
          <TeleversementPhotos publicationId={publication.id} />
          {publication.photos && publication.photos.length > 0 && (
            <div className="mt-3">
              <GaleriePhotosReordonnable photos={publication.photos} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        ouvert={confirmPublierOuvert}
        onFermer={() => setConfirmPublierOuvert(false)}
        titre="Publier cette page ?"
        description="Une fois publiee, cette page sera visible par tous les visiteurs de l'espace public."
        onConfirmer={() => {
          publierAction.mutate(undefined, {
            onSuccess: () => {
              toast.success("Publication mise en ligne")
              setConfirmPublierOuvert(false)
            },
          })
        }}
        enCours={publierAction.isPending}
        libelleAction="Publier"
      />
    </div>
  )
}
