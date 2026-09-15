// src/features/cotutelles/components/CotutelleForm.tsx
import { useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateCotutelle } from "@/features/cotutelles/api/useCreateCotutelle"
import { useUpdateCotutelle } from "@/features/cotutelles/api/useUpdateCotutelle"

const TYPES_COTUTELLE = [
  "Cadre",
  "Partenariat",
  "Subvention",
  "Appel à projets",
  "Autre",
]

interface CotutelleFormProps {
  cotutelle?: any
  onSucces: (cotutelle: any) => void
  onAnnuler: () => void
}

export function CotutelleForm({ cotutelle, onSucces, onAnnuler }: CotutelleFormProps) {
  const creation = useCreateCotutelle()
  const modification = useUpdateCotutelle(cotutelle?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: cotutelle?.nom ?? "",
      type: cotutelle?.type ?? "",
      etablissement_id: cotutelle?.etablissement_id ?? "",
      convention_id: cotutelle?.convention_id ?? undefined,
      statut: cotutelle?.statut ?? "BROUILLON",
    },
  })

  const onSubmit = (valeurs: any) => {
    if (cotutelle) {
      modification.mutate(valeurs, { onSuccess: onSucces })
    } else {
      creation.mutate(valeurs, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="cotutelle-nom">Nom</Label>
          <Input id="cotutelle-nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom?.message && <p className="text-sm text-destructive">{String(errors.nom.message)}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cotutelle-type">Type</Label>
          <Select value={undefined} onValueChange={() => {}}>
            <SelectTrigger id="cotutelle-type" aria-invalid={!!errors.type}>
              <SelectValue placeholder="Selectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {TYPES_COTUTELLE.map((t: any) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type?.message && <p className="text-sm text-destructive">{String(errors.type.message)}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cotutelle-etablissement">Établissement</Label>
          <Input
            id="cotutelle-etablissement"
            aria-invalid={!!errors.etablissement_id}
            {...register("etablissement_id")}
          />
          {errors.etablissement_id?.message && (
            <p className="text-sm text-destructive">{String(errors.etablissement_id.message)}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {cotutelle ? "Enregistrer les modifications" : "Créer la cotutelle"}
        </Button>
      </div>
    </form>
  )
}