// src/features/conventions/components/ConventionForm.tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { creerSchemaConvention, type ConventionFormValues } from "@/lib/validators/convention.schema"
import { useCreateConvention } from "@/features/conventions/api/useCreateConvention"
import { useUpdateConvention } from "@/features/conventions/api/useUpdateConvention"
import { usePartenariats } from "@/features/partenariats/api/usePartenariats"
import { useProjets } from "@/features/projets/api/useProjets"
import type { Convention } from "@/types/api"

interface ConventionFormProps {
  convention?: Convention
  onSucces: (convention: Convention) => void
  onAnnuler: () => void
}

const STATUTS = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "EN_ATTENTE_SIGNATURE", label: "En attente de signature" },
  { value: "SIGNEE", label: "Signee" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDUE", label: "Suspendue" },
  { value: "EXPIREE", label: "Expiree" },
]

// Valeur sentinelle pour l'option "Aucun" : Radix Select interdit value="".
// Convertie en "" dans onSubmit, puis en null par normaliserPayload avant l'envoi.
const VALEUR_AUCUN = "__aucun__"

export function ConventionForm({ convention, onSucces, onAnnuler }: ConventionFormProps) {
  const creation = useCreateConvention()
  const modification = useUpdateConvention(convention?.id ?? "")
  const enCours = creation.isPending || modification.isPending

  // Note : un select simple convient jusqu'a ~50 elements. Si le nombre de
  // partenariats ou de projets depasse ce seuil, migrer vers un combobox avec
  // recherche (Radix Popover + Command).
  const { data: pagePartenariats, isLoading: partenariatsEnChargement } = usePartenariats({ page: 1, limit: 100 })
  const { data: pageProjets, isLoading: projetsEnChargement } = useProjets({ page: 1, limit: 100 })
  const partenariats = pagePartenariats?.data ?? []
  const projets = pageProjets?.data ?? []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConventionFormValues>({
    resolver: zodResolver(creerSchemaConvention({ exigerDateDebutFuture: !convention })),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      reference: convention?.reference ?? "",
      titre: convention?.titre ?? "",
      date_signature: convention?.date_signature?.slice(0, 10) ?? "",
      date_debut: convention?.date_debut?.slice(0, 10) ?? "",
      date_fin: convention?.date_fin?.slice(0, 10) ?? "",
      statut: convention?.statut ?? "BROUILLON",
      description: convention?.description ?? "",
      partenariat_id: convention?.partenariat_id ?? "",
      projet_id: convention?.projet_id ?? "",
    },
  })

  // TODO : desactiver la soumission en creation si partenariat_id et
  // projet_id valent tous les deux "Aucun" (regle metier : au moins un lien).
  const onSubmit = (valeurs: ConventionFormValues) => {
    // Conversion explicite de la sentinelle "Aucun" en "" (puis null via
    // normaliserPayload) : le backend attend un UUID ou une valeur absente.
    const valeursEnvoyees: ConventionFormValues = {
      ...valeurs,
      partenariat_id: valeurs.partenariat_id === VALEUR_AUCUN ? "" : valeurs.partenariat_id,
      projet_id: valeurs.projet_id === VALEUR_AUCUN ? "" : valeurs.projet_id,
    }
    if (convention) {
      modification.mutate(valeursEnvoyees, { onSuccess: onSucces })
    } else {
      creation.mutate(valeursEnvoyees, { onSuccess: onSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reference" requis>Reference</Label>
          <Input id="reference" className="font-mono" aria-invalid={!!errors.reference} {...register("reference")} />
          {errors.reference && <p className="text-sm text-destructive">{errors.reference.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titre" requis>Titre</Label>
          <Input id="titre" aria-invalid={!!errors.titre} {...register("titre")} />
          {errors.titre && <p className="text-sm text-destructive">{errors.titre.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_signature">Date de signature</Label>
          <Input id="date_signature" type="date" {...register("date_signature")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut">Date de debut</Label>
          <Input id="date_debut" type="date" aria-invalid={!!errors.date_debut} {...register("date_debut")} />
          {errors.date_debut && <p className="text-sm text-destructive">{errors.date_debut.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_fin">Date de fin</Label>
          <Input id="date_fin" type="date" aria-invalid={!!errors.date_fin} {...register("date_fin")} />
          {errors.date_fin && <p className="text-sm text-destructive">{errors.date_fin.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Statut</Label>
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.statut}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="partenariat_id">Partenariat lie (optionnel)</Label>
          <Controller
            control={control}
            name="partenariat_id"
            render={({ field }) => (
              <Select
                value={field.value || VALEUR_AUCUN}
                onValueChange={field.onChange}
                disabled={partenariatsEnChargement}
              >
                <SelectTrigger id="partenariat_id" aria-invalid={!!errors.partenariat_id}>
                  <SelectValue placeholder="Selectionner un partenariat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VALEUR_AUCUN}>Aucun</SelectItem>
                  {partenariats.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.intitule || p.objet || `Partenariat ${p.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="projet_id">Projet lie (optionnel)</Label>
        <Controller
          control={control}
          name="projet_id"
          render={({ field }) => (
            <Select
              value={field.value || VALEUR_AUCUN}
              onValueChange={field.onChange}
              disabled={projetsEnChargement}
            >
              <SelectTrigger id="projet_id" aria-invalid={!!errors.projet_id}>
                <SelectValue placeholder="Selectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VALEUR_AUCUN}>Aucun</SelectItem>
                {projets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nom || p.intitule_officiel || `Projet ${p.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>Annuler</Button>
        <Button type="submit" disabled={enCours}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {convention ? "Enregistrer les modifications" : "Creer la convention"}
        </Button>
      </div>
    </form>
  )
}