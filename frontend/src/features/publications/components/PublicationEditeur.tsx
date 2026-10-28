// src/features/publications/components/PublicationEditeur.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Globe } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { obtenirInfoStatut } from "@/lib/status-mappings";
import { GaleriePhotosReordonnable } from "@/features/publications/components/GaleriePhotosReordonnable";
import { TeleversementPhotos } from "@/features/publications/components/TeleversementPhotos";
import { PhotosSelection } from "@/features/publications/components/PhotosSelection";
import { ImageCouvertureEditeur } from "@/features/publications/components/ImageCouvertureEditeur";
import {
  schemaPublication,
  type PublicationFormValues,
} from "@/lib/validators/publication.schema";
import { usePublication } from "@/features/publications/api/usePublication";
import { useCreatePublication } from "@/features/publications/api/useCreatePublication";
import { useUpdatePublication } from "@/features/publications/api/useUpdatePublication";
import { usePublierPublication } from "@/features/publications/api/usePublierPublication";
import { ajouterPhoto } from "@/features/publications/api/usePhotosPublication";

export function PublicationEditeur({ projetId }: { projetId: string }) {
  const [confirmPublierOuvert, setConfirmPublierOuvert] = useState(false);
  const [photosSelectionnees, setPhotosSelectionnees] = useState<File[]>([]);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);
  const { data: publication, isLoading } = usePublication(projetId);
  const queryClient = useQueryClient();

  const creation = useCreatePublication(projetId);
  const modification = useUpdatePublication(publication?.id ?? "", projetId);
  const publierAction = usePublierPublication(publication?.id ?? "", projetId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(schemaPublication),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      titre: "",
      description_publique: "",
      resultats: "",
    },
    // La publication est chargée de façon asynchrone dans ce composant. `values`
    // hydrate React Hook Form dès sa réception, tandis que keepDirtyValues évite
    // qu'un rafraîchissement de cache n'écrase une saisie en cours.
    values: {
      titre: publication?.titre ?? "",
      description_publique: publication?.description_publique ?? "",
      resultats: publication?.resultats ?? "",
    },
    resetOptions: { keepDirtyValues: true, keepErrors: true },
  });

  if (isLoading) {
    return <Loader label="Chargement de la publication" pleinePage />;
  }

  const onSubmit = async (valeurs: PublicationFormValues) => {
    if (publication) {
      modification.mutate(valeurs, {
        onSuccess: () => {
          reset(valeurs);
          toast.success("Publication mise à jour");
        },
        onError: (erreur) => toast.error(erreur.message),
      });
      return;
    }

    try {
      const nouvelle = await creation.mutateAsync(valeurs);
      if (photosSelectionnees.length > 0) {
        setEnvoiPhotos(true);
        try {
          // Envoi une à une ; les photos déjà envoyées sont retirées de la sélection.
          for (const fichier of [...photosSelectionnees]) {
            await ajouterPhoto(nouvelle.id, fichier);
            setPhotosSelectionnees((courantes) =>
              courantes.filter((f) => f !== fichier),
            );
          }
        } finally {
          setEnvoiPhotos(false);
          queryClient.invalidateQueries({ queryKey: ["publications"] });
        }
      }
      toast.success("Publication créée");
    } catch (erreur) {
      toast.error(
        erreur instanceof Error ? erreur.message : "Une erreur est survenue",
      );
    }
  };

  const enCours = creation.isPending || modification.isPending || envoiPhotos;

  return (
    <div className="flex flex-col gap-6">
      {publication && (
        <div className="flex items-center justify-between">
          <StatusBadge
            libelle={obtenirInfoStatut(publication.statut).libelle}
            tonalite={obtenirInfoStatut(publication.statut).tonalite}
          />
          {publication.statut === "BROUILLON" && (
            <Button
              variant="outline"
              onClick={() => setConfirmPublierOuvert(true)}
              disabled={!isValid || isDirty || enCours}
              title={
                isDirty
                  ? "Enregistrez les modifications avant de publier."
                  : undefined
              }
            >
              <Globe size={16} /> Publier
            </Button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titre" requis>
            Titre
          </Label>
          <Input
            id="titre"
            aria-invalid={!!errors.titre}
            {...register("titre")}
          />
          {errors.titre && (
            <p className="text-sm text-destructive">{errors.titre.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description_publique">Description publique</Label>
          <Textarea
            id="description_publique"
            {...register("description_publique")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resultats">Resultats</Label>
          <Textarea id="resultats" {...register("resultats")} />
        </div>

        {!publication && (
          <div className="flex flex-col gap-1.5">
            <Label>Images (plusieurs possibles)</Label>
            <PhotosSelection
              fichiers={photosSelectionnees}
              onChange={setPhotosSelectionnees}
              disabled={enCours}
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={enCours || !isValid}
          className="self-start"
        >
          {enCours && <LoaderCircle className="animate-spin" />}
          {publication ? "Enregistrer" : "Créer la publication"}
        </Button>
      </form>

      {publication ? (
        <ImageCouvertureEditeur publication={publication} projetId={projetId} />
      ) : (
        <section
          className="flex flex-col gap-1"
          aria-labelledby="titre-image-couverture"
        >
          <h3
            id="titre-image-couverture"
            className="font-heading text-sm font-semibold"
          >
            Image de couverture
          </h3>
          <p className="text-sm text-muted-foreground">
            Enregistrez d’abord la publication pour ajouter une couverture.
          </p>
        </section>
      )}

      {publication && (
        <div>
          <h3 className="mb-2 font-heading text-sm font-semibold">
            Photos illustratives
          </h3>
          <TeleversementPhotos publicationId={publication.id} />
          {publication.photos && publication.photos.length > 0 && (
            <div className="mt-3">
              <GaleriePhotosReordonnable
                key={publication.photos
                  .map(
                    (photo) =>
                      `${photo.id}:${photo.ordre}:${photo.legende ?? ""}`,
                  )
                  .join("|")}
                photos={publication.photos}
              />
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
              toast.success("Publication mise en ligne");
              setConfirmPublierOuvert(false);
            },
            onError: (erreur) => toast.error(erreur.message),
          });
        }}
        enCours={publierAction.isPending}
        libelleAction="Publier"
      />
    </div>
  );
}
