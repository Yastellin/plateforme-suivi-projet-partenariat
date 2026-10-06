// src/features/projets/components/ProjetWizard.tsx
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WizardProgressBar } from "@/components/forms/wizard/WizardProgressBar"
import { SelectionPorteur } from "@/features/projets/components/SelectionPorteur"
import { SelectionBailleurs } from "@/features/projets/components/SelectionBailleurs"
import { SelectionBeneficiaires } from "@/features/projets/components/SelectionBeneficiaires"
import { SelectionSites } from "@/features/projets/components/SelectionSites"
import { useCreateProjet } from "@/features/projets/api/useCreateProjet"
import { useWizardDraft } from "@/components/forms/wizard/useWizardDraft"
import { schemaProjet, type ProjetFormValues } from "@/lib/validators/projet.schema"
import type { Projet } from "@/types/api"

interface ProjetWizardProps {
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

const ETAPES = [
  "Informations",
  "Dates & statut",
  "Porteur",
  "Referentiels",
  "Recapitulatif",
]

// Wizard multi-etapes pour la creation d'un projet (section 7.2 :
// "wizard de creation"). L'etablissement cree toujours en BROUILLON
// (section 5). Etapes numerotees, barre de progression, recapitulatif.
export function ProjetWizard({ onSucces, onAnnuler }: ProjetWizardProps) {
  const [etapeActive, setEtapeActive] = useState(0)
  const creation = useCreateProjet()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjetFormValues>({
    resolver: zodResolver(schemaProjet) as any,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: "",
      intitule_officiel: "",
      type: "",
      domaine: "",
      budget: undefined,
      date_debut: "",
      date_fin_prevue: "",
      statut: "BROUILLON",
      porteur_id: undefined,
      bailleur_ids: [],
      beneficiaire_ids: [],
      site_ids: [],
    },
  })

  const valeurs = watch()
  const derniereEtape = etapeActive === ETAPES.length - 1

  // Sauvegarde auto brouillon toutes les 30s (section 8.2)
  const { effacerBrouillon } = useWizardDraft({
    cle: "projet-wizard",
    valeurs: { ...valeurs, etapeActive },
    actif: !creation.isPending,
    onRestaurer: (d) => {
      if (d.etapeActive !== undefined) setEtapeActive(d.etapeActive as number)
    },
  })

  const suivant = () => {
    if (derniereEtape) {
      handleSubmit(onSubmit)()
    } else {
      setEtapeActive((e) => e + 1)
    }
  }

  const precedent = () => setEtapeActive((e) => Math.max(0, e - 1))

  function onSubmit(valeurs: ProjetFormValues) {
    creation.mutate(valeurs, {
      onSuccess: (projet) => {
        effacerBrouillon()
        toast.success("Projet créé avec succès !")
        onSucces(projet)
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Erreur lors de la création.")
      },
    })
  }

  const contenuEtapes = [
    // Etape 1 : Informations generales
    <div key="info" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nom">
            Nom du projet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nom"
            aria-invalid={!!errors.nom}
            {...register("nom")}
          />
          {errors.nom && (
            <p className="text-sm text-destructive">{errors.nom.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="intitule_officiel">Intitulé officiel</Label>
          <Input id="intitule_officiel" {...register("intitule_officiel")} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">
            Type <span className="text-destructive">*</span>
          </Label>
          <Input
            id="type"
            aria-invalid={!!errors.type}
            {...register("type")}
          />
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="domaine">Domaine</Label>
          <Input id="domaine" {...register("domaine")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            className="font-mono"
            {...register("budget")}
          />
        </div>
      </div>
    </div>,

    // Etape 2 : Dates et statut
    <div key="dates" className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut">
            Date de début <span className="text-destructive">*</span>
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_fin_prevue">
            Date de fin prévue <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date_fin_prevue"
            type="date"
            aria-invalid={!!errors.date_fin_prevue}
            {...register("date_fin_prevue")}
          />
          {errors.date_fin_prevue && (
            <p className="text-sm text-destructive">{errors.date_fin_prevue.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Statut</Label>
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Le statut est défini à BROUILLON par défaut. Vous pourrez le modifier ultérieurement.
      </p>
    </div>,

    // Etape 3 : Porteur
    <div key="porteur" className="flex flex-col gap-1.5">
      <Label>Porteur du projet</Label>
      <Controller
        control={control}
        name="porteur_id"
        render={({ field }) => (
          <SelectionPorteur valeur={field.value} onChange={field.onChange} />
        )}
      />
    </div>,

    // Etape 4 : Referentiels (bailleurs, beneficiaires, sites)
    <div key="refs" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Bailleurs</Label>
        <Controller
          control={control}
          name="bailleur_ids"
          render={({ field }) => (
            <SelectionBailleurs valeur={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Bénéficiaires</Label>
        <Controller
          control={control}
          name="beneficiaire_ids"
          render={({ field }) => (
            <SelectionBeneficiaires valeur={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Sites concernés</Label>
        <Controller
          control={control}
          name="site_ids"
          render={({ field }) => (
            <SelectionSites valeur={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>
    </div>,

    // Etape 5 : Recapitulatif
    <div key="recap" className="flex flex-col gap-4">
      <h3 className="font-heading text-sm font-medium text-muted-foreground">
        Vérifiez les informations avant la création
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <RecapChamp label="Nom" valeur={valeurs.nom || "—"} />
        <RecapChamp label="Type" valeur={valeurs.type || "—"} />
        <RecapChamp label="Domaine" valeur={valeurs.domaine || "—"} />
        <RecapChamp
          label="Budget"
          valeur={valeurs.budget ? `${valeurs.budget.toLocaleString("fr-FR")} MGA` : "—"}
        />
        <RecapChamp label="Date de début" valeur={valeurs.date_debut || "—"} />
        <RecapChamp label="Date de fin prévue" valeur={valeurs.date_fin_prevue || "—"} />
        <RecapChamp label="Statut" valeur={STATUTS.find((s) => s.value === valeurs.statut)?.label ?? valeurs.statut} />
        <RecapChamp
          label="Porteur"
          valeur={valeurs.porteur_id ? "Sélectionné" : "Non défini"}
        />
        <RecapChamp label="Bailleurs" valeur={`${valeurs.bailleur_ids?.length ?? 0} sélectionné(s)`} />
        <RecapChamp label="Bénéficiaires" valeur={`${valeurs.beneficiaire_ids?.length ?? 0} sélectionné(s)`} />
        <RecapChamp label="Sites" valeur={`${valeurs.site_ids?.length ?? 0} sélectionné(s)`} />
      </div>
      {valeurs.intitule_officiel && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Intitulé officiel</span>
          <p className="text-sm text-foreground">{valeurs.intitule_officiel}</p>
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
          Précédent
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
            {derniereEtape ? "Créer le projet" : "Suivant"}
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
