// src/features/conventions/components/ConventionForm.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateConvention } from "@/features/conventions/api/useCreateConvention"
import { useUpdateConvention } from "@/features/conventions/api/useUpdateConvention"

interface ConventionFormProps {
  convention?: any
  onSucces: (convention: any) => void
  onAnnuler: () => void
}

// Schéma de validation inspiré du backend CreateConventionDto
export const schemaConventionForm = z.object({
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
  etablissement_id: z.string().min(1, "L'établissement est requis"),
  statut: z.enum(["BROUILLON", "EN_ATTENTE_SIGNATURE", "SIGNEE", "ACTIVE", "SUSPENDUE", "EXPIREE"]),
  visibilite: z.enum(["PUBLIC", "PRIVE"]),
  etape_circuit: z.enum(["REDACTION", "TRANSMISSION", "VERIFICATION_DAJ", "ATTENTE_SIGNATURE", "SIGNEE"]).optional(),
})

export type ConventionFormValues = z.infer<typeof schemaConventionForm>

export function ConventionForm({ convention, onSucces, onAnnuler }: ConventionFormProps) {
  const creation = useCreateConvention()
  const modification = useUpdateConvention(convention?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConventionFormValues>({
    resolver: zodResolver(schemaConventionForm),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: convention?.nom ?? "",
      description: convention?.description ?? "",
      etablissement_id: convention?.etablissement_id ?? "",
      statut: convention?.statut ?? "BROUILLON",
      visibilite: convention?.visibilite ?? "PRIVE",
      etape_circuit: convention?.etape_circuit ?? "REDACTION",
    },
  })

  const onSubmit = (valeurs: ConventionFormValues) => {
    const payload = {
      nom: valeurs.nom,
      description: valeurs.description || undefined,
      etablissement_id: valeurs.etablissement_id,
      statut: valeurs.statut,
      visibilite: valeurs.visibilite,
      etape_circuit: valeurs.etape_circuit || "REDACTION",
    }
    if (convention) {
      modification.mutate(payload, { onSuccess: onSucces })
    } else {
      creation.mutate(payload, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="convention-nom">Nom</Label>
          <Input id="convention-nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="convention-etablissement">Établissement</Label>
          <Input
            id="convention-etablissement"
            aria-invalid={!!errors.etablissement_id}
            {...register("etablissement_id")}
          />
          {errors.etablissement_id && <p className="text-sm text-destructive">{errors.etablissement_id.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="convention-statut">Statut</Label>
          <Select value={undefined} onValueChange={() => {}}>
            <SelectTrigger id="convention-statut" aria-invalid={!!errors.statut}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BROUILLON">Brouillon</SelectItem>
              <SelectItem value="EN_ATTENTE_SIGNATURE">En attente signature</SelectItem>
              <SelectItem value="SIGNEE">Signée</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDUE">Suspendue</SelectItem>
              <SelectItem value="EXPIREE">Expirée</SelectItem>
            </SelectContent>
          </Select>
          {errors.statut && <p className="text-sm text-destructive">{errors.statut.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="convention-visibilite">Visibilité</Label>
          <Select value={undefined} onValueChange={() => {}}>
            <SelectTrigger id="convention-visibilite" aria-invalid={!!errors.visibilite}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIVE">Prive</SelectItem>
              <SelectItem value="PUBLIC">Public</SelectItem>
            </SelectContent>
          </Select>
          {errors.visibilite && <p className="text-sm text-destructive">{errors.visibilite.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="convention-etape">Étape du circuit</Label>
          <Select value={undefined} onValueChange={() => {}}>
            <SelectTrigger id="convention-etape" aria-invalid={!!errors.etape_circuit}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REDACTION">Redaction</SelectItem>
              <SelectItem value="TRANSMISSION">Transmission</SelectItem>
              <SelectItem value="VERIFICATION_DAJ">Vérification DAJ</SelectItem>
              <SelectItem value="ATTENTE_SIGNATURE">Attente signature</SelectItem>
              <SelectItem value="SIGNEE">Signée</SelectItem>
            </SelectContent>
          </Select>
          {errors.etape_circuit && <p className="text-sm text-destructive">{errors.etape_circuit.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {convention ? "Enregistrer les modifications" : "Créer la convention"}
        </Button>
      </div>
    </form>
  )
}