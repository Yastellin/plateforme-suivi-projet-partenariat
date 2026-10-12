// src/features/cotutelles/components/CotutelleForm.tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { creerSchemaCotutelle, type CotutelleFormValues } from "@/lib/validators/cotutelle.schema"
import { useCreateCotutelle } from "@/features/cotutelles/api/useCreateCotutelle"
import { useUpdateCotutelle } from "@/features/cotutelles/api/useUpdateCotutelle"
import type { CotutelleThese } from "@/types/api"

interface CotutelleFormProps {
  cotutelle?: CotutelleThese
  onSucces: (cotutelle: CotutelleThese) => void
  onAnnuler: () => void
}

const TYPES = [
  { value: "COTUTELLE", label: "Co-tutelle" },
  { value: "COENCADREMENT", label: "Co-encadrement" },
]

export function CotutelleForm({ cotutelle, onSucces, onAnnuler }: CotutelleFormProps) {
  const creation = useCreateCotutelle()
  const modification = useUpdateCotutelle(cotutelle?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CotutelleFormValues>({
    resolver: zodResolver(creerSchemaCotutelle({ exigerDateDebutFuture: !cotutelle })),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom_doctorant: cotutelle?.nom_doctorant ?? "",
      specialite: cotutelle?.specialite ?? "",
      directeur_these_local: cotutelle?.directeur_these_local ?? "",
      directeur_these_partenaire: cotutelle?.directeur_these_partenaire ?? "",
      type: cotutelle?.type ?? "COTUTELLE",
      date_debut: cotutelle?.date_debut?.slice(0, 10) ?? "",
      date_prevue_soutenance: cotutelle?.date_prevue_soutenance?.slice(0, 10) ?? "",
      financement_bourse: cotutelle?.financement_bourse ?? "",
      etablissement_id: cotutelle?.etablissement_id ?? "",
      partenaire_id: cotutelle?.partenaire_id ?? "",
    },
  })

  const onSubmit = (valeurs: CotutelleFormValues) => {
    if (cotutelle) {
      modification.mutate(valeurs, { onSuccess: onSucces })
    } else {
      creation.mutate(valeurs, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nom_doctorant" requis>Nom du doctorant</Label>
        <Input id="nom_doctorant" aria-invalid={!!errors.nom_doctorant} {...register("nom_doctorant")} />
        {errors.nom_doctorant && <p className="text-sm text-destructive">{errors.nom_doctorant.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="specialite">Specialite</Label>
          <Input id="specialite" {...register("specialite")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.type}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="directeur_these_local">Directeur de these (local)</Label>
          <Input id="directeur_these_local" {...register("directeur_these_local")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="directeur_these_partenaire">Directeur de these (partenaire)</Label>
          <Input id="directeur_these_partenaire" {...register("directeur_these_partenaire")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut" requis>Date de debut</Label>
          <Input id="date_debut" type="date" aria-invalid={!!errors.date_debut} {...register("date_debut")} />
          {errors.date_debut && <p className="text-sm text-destructive">{errors.date_debut.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_prevue_soutenance">Date prevue de soutenance</Label>
          <Input id="date_prevue_soutenance" type="date" aria-invalid={!!errors.date_prevue_soutenance} {...register("date_prevue_soutenance")} />
          {errors.date_prevue_soutenance && <p className="text-sm text-destructive">{errors.date_prevue_soutenance.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="financement_bourse">Financement / bourse</Label>
        <Input id="financement_bourse" {...register("financement_bourse")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="etablissement_id" requis>Etablissement malgache</Label>
          <Input id="etablissement_id" aria-invalid={!!errors.etablissement_id} {...register("etablissement_id")} />
          {errors.etablissement_id && <p className="text-sm text-destructive">{errors.etablissement_id.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenaire_id" requis>Universite partenaire</Label>
          <Input id="partenaire_id" aria-invalid={!!errors.partenaire_id} {...register("partenaire_id")} />
          {errors.partenaire_id && <p className="text-sm text-destructive">{errors.partenaire_id.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {cotutelle ? "Enregistrer les modifications" : "Creer la cotutelle"}
        </Button>
      </div>
    </form>
  )
}