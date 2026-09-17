// src/features/partenariats/components/PartenariatWizard.tsx
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WizardProgressBar } from "@/components/forms/wizard/WizardProgressBar"
import { SelectionEtablissements } from "@/features/partenariats/components/SelectionEtablissements"
import { SelectionPartenaires } from "@/features/partenariats/components/SelectionPartenaires"
import { useCreatePartenariat } from "@/features/partenariats/api/useCreatePartenariat"
import {
  schemaPartenariat,
  type PartenariatFormValues,
} from "@/lib/validators/partenariat.schema"
import type { Partenariat } from "@/types/api"

interface PartenariatWizardProps {
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

const ETAPES = [
  "Informations",
  "Etablissements",
  "Partenaires",
  "Recapitulatif",
]

// Wizard multi-etapes pour la creation d'un partenariat (section 7.2 :
// "wizard de creation"). Etapes numerotees, barre de progression,
// recapitulatif avant soumission.
export function PartenariatWizard({ onSucces, onAnnuler }: PartenariatWizardProps) {
  const [etapeActive, setEtapeActive] = useState(0)
  const creation = useCreatePartenariat()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartenariatFormValues>({
    resolver: zodResolver(schemaPartenariat),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      intitule: "",
      objet: "",
      domaine: "RECHERCHE",
      date_debut: "",
      date_fin: "",
      statut: "BROUILLON",
      etablissement_ids: [],
      partenaire_ids: [],
      actions_realisees: "",
      actions_en_cours: "",
      actions_prevues: "",
      resultats_obtenus: "",
      difficultes_contraintes: "",
      perspectives_recommandations: "",
    },
  })

  const valeurs = watch()
  const derniereEtape = etapeActive === ETAPES.length - 1

  const suivant = () => {
    if (derniereEtape) {
      handleSubmit(onSubmit)()
    } else {
      setEtapeActive((e) => e + 1)
    }
  }

  const precedent = () => setEtapeActive((e) => Math.max(0, e - 1))

  function onSubmit(valeurs: PartenariatFormValues) {
    creation.mutate(valeurs, {
      onSuccess: (partenariat) => {
        toast.success("Partenariat cree avec succes !")
        onSucces(partenariat)
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Erreur lors de la creation.")
      },
    })
  }

  const contenuEtapes = [
    // Etape 1 : Informations generales
    <div key="info" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="intitule">
          Intitule <span className="text-destructive">*</span>
        </Label>
        <Input
          id="intitule"
          aria-invalid={!!errors.intitule}
          {...register("intitule")}
        />
        {errors.intitule && (
          <p className="text-sm text-destructive">{errors.intitule.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="objet">Objet</Label>
        <Textarea id="objet" {...register("objet")} rows={3} />
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
                  <SelectValue placeholder="Selectionner" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.domaine && (
            <p className="text-sm text-destructive">{errors.domaine.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut">
            Date de debut <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date_debut"
            type="date"
            aria-invalid={!!errors.date_debut}
            {...register("date_debut")}
          />
          {errors.date_debut && (
            <p className="text-sm text-destructive">{errors.date_debut.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date_fin">Date de fin (optionnel)</Label>
        <Input id="date_fin" type="date" {...register("date_fin")} />
      </div>
    </div>,

    // Etape 2 : Etablissements
    <div key="etabs" className="flex flex-col gap-1.5">
      <Label>
        Etablissements concernes <span className="text-destructive">*</span>
      </Label>
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
    </div>,

    // Etape 3 : Partenaires
    <div key="parts" className="flex flex-col gap-1.5">
      <Label>
        Partenaires concernes <span className="text-destructive">*</span>
      </Label>
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
    </div>,

    // Etape 4 : Recapitulatif
    <div key="recap" className="flex flex-col gap-4">
      <h3 className="font-heading text-sm font-medium text-muted-foreground">
        Verifiez les informations avant la creation
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <RecapChamp label="Intitule" valeur={valeurs.intitule || "—"} />
        <RecapChamp label="Domaine" valeur={DOMAINES.find((d) => d.value === valeurs.domaine)?.label ?? valeurs.domaine} />
        <RecapChamp label="Date de debut" valeur={valeurs.date_debut || "—"} />
        <RecapChamp label="Date de fin" valeur={valeurs.date_fin || "—"} />
        <RecapChamp
          label="Etablissements"
          valeur={`${valeurs.etablissement_ids.length} selectionne(s)`}
        />
        <RecapChamp
          label="Partenaires"
          valeur={`${valeurs.partenaire_ids.length} selectionne(s)`}
        />
      </div>
      {valeurs.objet && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Objet</span>
          <p className="text-sm text-foreground">{valeurs.objet}</p>
        </div>
      )}
    </div>,
  ]

  return (
    <div className="flex flex-col gap-6">
      <WizardProgressBar etapes={ETAPES} etapeActive={etapeActive} />

      <div className="min-h-48">{contenuEtapes[etapeActive]}</div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={precedent}
          disabled={etapeActive === 0 || creation.isPending}
        >
          Precedent
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onAnnuler}
            disabled={creation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={suivant}
            disabled={creation.isPending}
          >
            {creation.isPending && <LoaderCircle className="animate-spin" />}
            {derniereEtape ? "Creer le partenariat" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RecapChamp({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{valeur}</span>
    </div>
  )
}
