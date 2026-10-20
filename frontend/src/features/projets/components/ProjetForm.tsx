// src/features/projets/components/ProjetForm.tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { creerSchemaProjet, type ProjetFormValues } from "@/lib/validators/projet.schema"
import { useCreateProjet } from "@/features/projets/api/useCreateProjet"
import { useUpdateProjet } from "@/features/projets/api/useUpdateProjet"
import { SelectionPorteur } from "@/features/projets/components/SelectionPorteur"
import { SelectionBailleurs } from "@/features/projets/components/SelectionBailleurs"
import { SelectionBeneficiaires } from "@/features/projets/components/SelectionBeneficiaires"
import { SelectionSites } from "@/features/projets/components/SelectionSites"
import type { Projet } from "@/types/api"

interface ProjetFormProps {
  projet?: Projet
  onSucces: (projet: Projet) => void
  onAnnuler: () => void
}

const STATUTS = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_COURS", label: "En cours" },
  { value: "SUSPENDU", label: "Suspendu" },
  { value: "EXPIRE", label: "Expire" },
  { value: "TERMINE", label: "Termine" },
]

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
    resolver: zodResolver(creerSchemaProjet({ exigerDateDebutFuture: !projet })) as any,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: projet?.nom ?? "",
      intitule_officiel: projet?.intitule_officiel ?? "",
      type: projet?.type ?? "",
      domaine: projet?.domaine ?? "",
      budget: projet?.budget ?? undefined,
      date_debut: projet?.date_debut?.slice(0, 10) ?? "",
      date_fin_prevue: projet?.date_fin_prevue?.slice(0, 10) ?? "",
      statut: projet?.statut ?? "BROUILLON",
      porteur_id: projet?.porteur_id ?? undefined,
      bailleurs_ids: projet?.bailleurs?.map((b) => b.bailleur_id) ?? [],
      beneficiaires_ids: projet?.beneficiaires?.map((b) => b.beneficiaire_id) ?? [],
      sites_ids: projet?.sites?.map((s) => s.site_id) ?? [],
    },
  })

  const onSubmit = (valeurs: ProjetFormValues) => {
    if (projet) {
      modification.mutate(valeurs, { onSuccess: onSucces })
    } else {
      creation.mutate(valeurs, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nom" requis>Nom du projet</Label>
          <Input id="nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="intitule_officiel">Intitulé officiel</Label>
          <Input id="intitule_officiel" {...register("intitule_officiel")} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type" requis>Type</Label>
          <Input id="type" aria-invalid={!!errors.type} {...register("type")} />
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="domaine">Domaine</Label>
          <Input id="domaine" {...register("domaine")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" type="number" step="0.01" className="font-mono" {...register("budget")} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut" requis>Date de début</Label>
          <Input id="date_debut" type="date" aria-invalid={!!errors.date_debut} {...register("date_debut")} />
          {errors.date_debut && <p className="text-sm text-destructive">{errors.date_debut.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_fin_prevue" requis>Date de fin prévue</Label>
          <Input id="date_fin_prevue" type="date" aria-invalid={!!errors.date_fin_prevue} {...register("date_fin_prevue")} />
          {errors.date_fin_prevue && <p className="text-sm text-destructive">{errors.date_fin_prevue.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Statut</Label>
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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

      <div className="flex flex-col gap-1.5">
        <Label>Porteur</Label>
        <Controller
          control={control}
          name="porteur_id"
          render={({ field }) => <SelectionPorteur valeur={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Bailleurs</Label>
        <Controller
          control={control}
          name="bailleurs_ids"
          render={({ field }) => <SelectionBailleurs valeur={field.value ?? []} onChange={field.onChange} />}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Bénéficiaires</Label>
        <Controller
          control={control}
          name="beneficiaires_ids"
          render={({ field }) => <SelectionBeneficiaires valeur={field.value ?? []} onChange={field.onChange} />}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Sites concernés</Label>
        <Controller
          control={control}
          name="sites_ids"
          render={({ field }) => <SelectionSites valeur={field.value ?? []} onChange={field.onChange} />}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>Annuler</Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {projet ? "Enregistrer les modifications" : "Créer le projet"}
        </Button>
      </div>
    </form>
  )
}