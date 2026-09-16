// src/features/partenariats/components/PartenariatForm.tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { schemaPartenariat, type PartenariatFormValues } from "@/lib/validators/partenariat.schema"
import { useCreatePartenariat } from "@/features/partenariats/api/useCreatePartenariat"
import { useUpdatePartenariat } from "@/features/partenariats/api/useUpdatePartenariat"
import { SelectionEtablissements } from "@/features/partenariats/components/SelectionEtablissements"
import { SelectionPartenaires } from "@/features/partenariats/components/SelectionPartenaires"
import type { Partenariat } from "@/types/api"

interface PartenariatFormProps {
  partenariat?: Partenariat
  onSucces: (partenariat: Partenariat) => void
  onAnnuler: () => void
}

const DOMAINES = [
  { value: "RECHERCHE", label: "Recherche" },
  { value: "FORMATION", label: "Formation" },
  { value: "INNOVATION", label: "Innovation" },
  { value: "DEVELOPPEMENT", label: "Developpement" },
  { value: "COOPERATION_INSTITUTIONNELLE", label: "Cooperation institutionnelle" },
  { value: "AUTRE", label: "Autre" },
]

const STATUTS = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_COURS", label: "En cours" },
  { value: "SUSPENDU", label: "Suspendu" },
  { value: "TERMINE", label: "Termine" },
]

export function PartenariatForm({ partenariat, onSucces, onAnnuler }: PartenariatFormProps) {
  const creation = useCreatePartenariat()
  const modification = useUpdatePartenariat(partenariat?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartenariatFormValues>({
    resolver: zodResolver(schemaPartenariat),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      intitule: partenariat?.intitule ?? "",
      objet: partenariat?.objet ?? "",
      domaine: partenariat?.domaine ?? "RECHERCHE",
      date_debut: partenariat?.date_debut?.slice(0, 10) ?? "",
      date_fin: partenariat?.date_fin?.slice(0, 10) ?? "",
      statut: partenariat?.statut ?? "BROUILLON",
      etablissement_ids: partenariat?.etablissements?.map((e) => e.etablissement_id) ?? [],
      partenaire_ids: partenariat?.partenaires?.map((p) => p.partenaire_id) ?? [],
      actions_realisees: partenariat?.actions_realisees ?? "",
      actions_en_cours: partenariat?.actions_en_cours ?? "",
      actions_prevues: partenariat?.actions_prevues ?? "",
      resultats_obtenus: partenariat?.resultats_obtenus ?? "",
      difficultes_contraintes: partenariat?.difficultes_contraintes ?? "",
      perspectives_recommandations: partenariat?.perspectives_recommandations ?? "",
    },
  })

  const onSubmit = (valeurs: PartenariatFormValues) => {
    if (partenariat) {
      modification.mutate(valeurs, { onSuccess: onSucces })
    } else {
      creation.mutate(valeurs, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="intitule">Intitule</Label>
        <Input id="intitule" aria-invalid={!!errors.intitule} {...register("intitule")} />
        {errors.intitule && <p className="text-sm text-destructive">{errors.intitule.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="objet">Objet</Label>
        <Textarea id="objet" {...register("objet")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Domaine</Label>
          <Controller
            control={control}
            name="domaine"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.domaine}>
                  <SelectValue placeholder="Selectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.domaine && <p className="text-sm text-destructive">{errors.domaine.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Statut</Label>
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.statut}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut">Date de debut</Label>
          <Input id="date_debut" type="date" aria-invalid={!!errors.date_debut} {...register("date_debut")} />
          {errors.date_debut && <p className="text-sm text-destructive">{errors.date_debut.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_fin">Date de fin</Label>
          <Input id="date_fin" type="date" {...register("date_fin")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
  <Label>Etablissements concernes</Label>
  <Controller
    control={control}
    name="etablissement_ids"
    render={({ field }) => (
      <SelectionEtablissements valeur={field.value} onChange={field.onChange} />
    )}
  />
</div>

<div className="flex flex-col gap-1.5">
  <Label>Partenaires concernes</Label>
  <Controller
    control={control}
    name="partenaire_ids"
    render={({ field }) => (
      <SelectionPartenaires valeur={field.value} onChange={field.onChange} />
    )}
  />
</div>

      <div className="flex flex-col gap-1.5">
        <Label>Etablissements concernes</Label>
        <Controller
          control={control}
          name="etablissement_ids"
          render={({ field }) => (
            <SelectionEtablissements valeur={field.value} onChange={field.onChange} />
          )}
        />
        {errors.etablissement_ids && (
          <p className="text-sm text-destructive">{errors.etablissement_ids.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Partenaires concernes</Label>
        <Controller
          control={control}
          name="partenaire_ids"
          render={({ field }) => (
            <SelectionPartenaires valeur={field.value} onChange={field.onChange} />
          )}
        />
        {errors.partenaire_ids && (
          <p className="text-sm text-destructive">{errors.partenaire_ids.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="actions_realisees">Actions realisees</Label>
          <Textarea id="actions_realisees" {...register("actions_realisees")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="actions_en_cours">Actions en cours</Label>
          <Textarea id="actions_en_cours" {...register("actions_en_cours")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="actions_prevues">Actions prevues</Label>
          <Textarea id="actions_prevues" {...register("actions_prevues")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resultats_obtenus">Resultats obtenus</Label>
          <Textarea id="resultats_obtenus" {...register("resultats_obtenus")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="difficultes_contraintes">Difficultes / contraintes</Label>
          <Textarea id="difficultes_contraintes" {...register("difficultes_contraintes")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perspectives_recommandations">Perspectives / recommandations</Label>
          <Textarea id="perspectives_recommandations" {...register("perspectives_recommandations")} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {partenariat ? "Enregistrer les modifications" : "Creer le partenariat"}
        </Button>
      </div>
    </form>
  )
}