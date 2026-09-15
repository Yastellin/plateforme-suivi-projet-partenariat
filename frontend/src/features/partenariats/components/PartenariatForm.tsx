// src/features/partenariats/components/PartenariatForm.tsx
import { useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreatePartenariat } from "@/features/partenariats/api/useCreatePartenariat"
import { useUpdatePartenariat } from "@/features/partenariats/api/useUpdatePartenariat"
import type { Partenaire } from "@/types/api"

interface PartenariatFormProps {
  partenariat?: Partenaire
  onSucces: (partenariat: Partenaire) => void
  onAnnuler: () => void
}

const TYPES_PARTENARIAT = [
  "Universite",
  "Organisme de recherche",
  "Entreprise",
  "ONG",
  "Institution publique",
  "Autre",
]

export function PartenariatForm({ partenariat, onSucces, onAnnuler }: PartenariatFormProps) {
  const creation = useCreatePartenariat()
  const modification = useUpdatePartenariat(partenariat?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: partenariat?.nom ?? "",
      type: partenariat?.type ?? "",
      etablissement_id: partenariat?.etablissement_id ?? "",
      convention_id: partenariat?.convention_id ?? undefined,
      statut: partenariat?.statut ?? "BROUILLON",
    },
  })

  const onSubmit = (valeurs: any) => {
    if (partenariat) {
      modification.mutate(valeurs, { onSuccess: onSucces })
    } else {
      creation.mutate(valeurs, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="partenariat-nom">Nom</Label>
          <Input id="partenariat-nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom?.message && <p className="text-sm text-destructive">{String(errors.nom.message)}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenariat-type">Type</Label>
          <Select value={undefined} onValueChange={() => {}}>
            <SelectTrigger id="partenariat-type" aria-invalid={!!errors.type}>
              <SelectValue placeholder="Selectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {TYPES_PARTENARIAT.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type?.message && <p className="text-sm text-destructive">{String(errors.type.message)}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenariat-etablissement">Établissement</Label>
          <Input
            id="partenariat-etablissement"
            aria-invalid={!!errors.etablissement_id}
            {...register("etablissement_id")}
          />
          {errors.etablissement_id?.message && (
            <p className="text-sm text-destructive">{String(errors.etablissement_id.message)}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenariat-statut">Statut</Label>
          <Select value={undefined} onValueChange={() => {}}>
            <SelectTrigger id="partenariat-statut" aria-invalid={!!errors.statut}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BROUILLON">Brouillon</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="EN_COURS">En cours</SelectItem>
              <SelectItem value="SUSPENDU">Suspendu</SelectItem>
              <SelectItem value="TERMINE">Terminé</SelectItem>
            </SelectContent>
          </Select>
          {errors.statut?.message && <p className="text-sm text-destructive">{String(errors.statut.message)}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {partenariat ? "Enregistrer les modifications" : "Créer le partenariat"}
        </Button>
      </div>
    </form>
  )
}