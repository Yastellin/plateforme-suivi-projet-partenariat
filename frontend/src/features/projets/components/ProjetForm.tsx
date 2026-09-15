// src/features/projets/components/ProjetForm.tsx
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateProjet, type PayloadProjet } from "@/features/projets/api/useCreateProjet"
import { useUpdateProjet } from "@/features/projets/api/useUpdateProjet"
import type { Partenaire } from "@/types/api"

interface ProjetFormProps {
  projet?: Partenaire
  onSucces: (projet: Partenaire) => void
  onAnnuler: () => void
}

const TYPES_PROJET = [
  "Recherche",
  "Formation",
  "Développement durable",
  "Culture",
  "Santé",
  "Autre",
]

// Schéma de validation inspiré du backend CreateProjetDto
export const schemaProjet = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(255, "Le nom ne doit pas dépasser 255 caractères"),
  description: z
    .string()
    .trim()
    .max(2000, "La description ne doit pas dépasser 2000 caractères")
    .optional()
    .or(z.literal("")),
  bailleur: z.string().trim().max(255).optional().or(z.literal("")),
  beneficiaire: z.string().trim().max(255).optional().or(z.literal("")),
  site: z.string().trim().url("L'URL du site est invalide").max(255).optional().or(z.literal("")),
  etablissement_id: z.string().min(1, "L'établissement est requis"),
  type: z.string().trim().optional().or(z.literal("")),
})

export type ProjetFormValues = z.infer<typeof schemaProjet>

export function ProjetForm({ projet, onSucces, onAnnuler }: ProjetFormProps) {
  const creation = useCreateProjet()
  const modification = useUpdateProjet(projet?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjetFormValues>({
    resolver: zodResolver(schemaProjet),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: projet?.nom ?? "",
      description: projet?.description ?? "",
      bailleur: projet?.bailleur ?? "",
      beneficiaire: projet?.beneficiaire ?? "",
      site: projet?.site_web ?? "",
      etablissement_id: projet?.etablissement_id ?? "",
    },
  })

  const onSubmit = (valeurs: ProjetFormValues) => {
    const payload = {
      nom: valeurs.nom,
      description: valeurs.description || undefined,
      bailleur: valeurs.bailleur || undefined,
      beneficiaire: valeurs.beneficiaire || undefined,
      site: valeurs.site || undefined,
      etablissement_id: valeurs.etablissement_id,
    }
    if (projet) {
      modification.mutate(payload, { onSuccess: onSucces })
    } else {
      creation.mutate(payload as PayloadProjet, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="projet-nom">Nom</Label>
          <Input id="projet-nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projet-bailleur">Bailleur</Label>
          <Input id="projet-bailleur" aria-invalid={!!errors.bailleur} {...register("bailleur")} />
          {errors.bailleur && <p className="text-sm text-destructive">{errors.bailleur.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projet-beneficiaire">Bénéficiaire</Label>
          <Input id="projet-beneficiaire" aria-invalid={!!errors.beneficiaire} {...register("beneficiaire")} />
          {errors.beneficiaire && <p className="text-sm text-destructive">{errors.beneficiaire.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="projet-site">Site web</Label>
          <Input
            id="projet-site"
            type="url"
            placeholder="https://..."
            aria-invalid={!!errors.site}
            {...register("site")}
          />
          {errors.site && <p className="text-sm text-destructive">{errors.site.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="projet-description">Description</Label>
          <Input
            id="projet-description"
            placeholder="Description du projet"
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="projet-type" aria-invalid={!!errors.type}>
                  <SelectValue placeholder="Selectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_PROJET.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {projet ? "Enregistrer les modifications" : "Créer le projet"}
        </Button>
      </div>
    </form>
  )
}