// src/features/partenaires/components/PartenaireForm.tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { schemaPartenaire, type PartenaireFormValues } from "@/lib/validators/partenaire.schema"
import { versPayloadPartenaire } from "@/lib/validators/partenaire.schema"
import { useCreatePartenaire, type PayloadPartenaire } from "@/features/partenaires/api/useCreatePartenaire"
import { useUpdatePartenaire } from "@/features/partenaires/api/useUpdatePartenaire"
import type { Partenaire } from "@/types/api"

interface PartenaireFormProps {
  partenaire?: Partenaire
  onSucces: (partenaire: Partenaire) => void
  onAnnuler: () => void
}

const TYPES_PARTENAIRE = [
  "Universite",
  "Organisme de recherche",
  "Entreprise",
  "ONG",
  "Institution publique",
  "Autre",
]

// Formulaire de creation / modification d'un partenaire. Les valeurs
// optionnelles vides sont converties en undefined avant l'envoi au backend.
export function PartenaireForm({ partenaire, onSucces, onAnnuler }: PartenaireFormProps) {
  const creation = useCreatePartenaire()
  const modification = useUpdatePartenaire(partenaire?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartenaireFormValues>({
    resolver: zodResolver(schemaPartenaire),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: partenaire?.nom ?? "",
      type: partenaire?.type ?? "",
      pays: partenaire?.pays ?? "",
      adresse: partenaire?.adresse ?? "",
      telephone: partenaire?.telephone ?? "",
      email: partenaire?.email ?? "",
      site_web: partenaire?.site_web ?? "",
      description: partenaire?.description ?? "",
      statut: partenaire?.statut ?? "ACTIF",
      visibilite: partenaire?.visibilite ?? "PRIVE",
      est_strategique: partenaire?.est_strategique ?? false,
    },
  })

  const onSubmit = (valeurs: PartenaireFormValues) => {
    const payload = versPayloadPartenaire(valeurs)
    if (partenaire) {
      modification.mutate(payload, { onSuccess: onSucces })
    } else {
      creation.mutate(payload as PayloadPartenaire, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="partenaire-nom">Nom</Label>
          <Input id="partenaire-nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenaire-type">Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="partenaire-type" aria-invalid={!!errors.type}>
                  <SelectValue placeholder="Selectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_PARTENAIRE.map((t) => (
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenaire-pays">Pays</Label>
          <Input id="partenaire-pays" aria-invalid={!!errors.pays} {...register("pays")} />
          {errors.pays && <p className="text-sm text-destructive">{errors.pays.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="partenaire-adresse">Adresse</Label>
          <Input id="partenaire-adresse" aria-invalid={!!errors.adresse} {...register("adresse")} />
          {errors.adresse && <p className="text-sm text-destructive">{errors.adresse.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenaire-telephone">Telephone</Label>
          <Input id="partenaire-telephone" type="tel" aria-invalid={!!errors.telephone} {...register("telephone")} />
          {errors.telephone && <p className="text-sm text-destructive">{errors.telephone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenaire-email">Email</Label>
          <Input id="partenaire-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="partenaire-site-web">Site web</Label>
          <Input
            id="partenaire-site-web"
            type="url"
            placeholder="https://..."
            aria-invalid={!!errors.site_web}
            {...register("site_web")}
          />
          {errors.site_web && <p className="text-sm text-destructive">{errors.site_web.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="partenaire-description">Description</Label>
          <Textarea
            id="partenaire-description"
            rows={4}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIF">Actif</SelectItem>
                  <SelectItem value="SUSPENDU">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Visibilite</Label>
          <Controller
            control={control}
            name="visibilite"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVE">Prive</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <Controller
            control={control}
            name="est_strategique"
            render={({ field }) => (
              <Checkbox
                id="partenaire-strategique"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
            )}
          />
          <Label htmlFor="partenaire-strategique" className="font-normal">
            Partenaire strategique (mis en avant dans la synthese annuelle)
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {partenaire ? "Enregistrer les modifications" : "Creer le partenaire"}
        </Button>
      </div>
    </form>
  )
}
