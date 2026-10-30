// src/features/comptes/components/FormulaireMotDePasse.tsx
import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, useReducedMotion } from "framer-motion"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  schemaChangerMotDePasse,
  type ChangerMotDePasseFormValues,
} from "@/lib/validators/compte.schema"
import { useChangerMotDePasse } from "@/features/comptes/api/useChangerMotDePasse"

type ChampMotDePasse = "actuel" | "nouveau" | "confirmation"

export function FormulaireMotDePasse() {
  const [secousse, setSecousse] = useState(false)
  const [visibilite, setVisibilite] = useState<
    Record<ChampMotDePasse, boolean>
  >({
    actuel: false,
    nouveau: false,
    confirmation: false,
  })
  const changement = useChangerMotDePasse()
  const reduireMouvement = useReducedMotion()
  const identifiant = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChangerMotDePasseFormValues>({
    resolver: zodResolver(schemaChangerMotDePasse),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const masquerMotsDePasse = () => {
    setVisibilite({ actuel: false, nouveau: false, confirmation: false })
  }

  const basculerVisibilite = (champ: ChampMotDePasse) => {
    setVisibilite((courante) => ({ ...courante, [champ]: !courante[champ] }))
  }

  const declencherSecousse = () => {
    setSecousse(true)
    setTimeout(() => setSecousse(false), 400)
  }

  const onSubmit = (valeurs: ChangerMotDePasseFormValues) => {
    masquerMotsDePasse()
    changement.mutate(valeurs, {
      onSuccess: () => {
        toast.success("Mot de passe modifié avec succès")
        reset()
        masquerMotsDePasse()
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Le mot de passe actuel est incorrect")
        declencherSecousse()
      },
    })
  }

  const onInvalid = () => {
    masquerMotsDePasse()
    declencherSecousse()
  }

  const boutonVisibilite = (champ: ChampMotDePasse) => {
    const visible = visibilite[champ]
    const Icone = visible ? EyeOff : Eye

    return (
      <button
        type="button"
        aria-label={
          visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
        aria-pressed={visible}
        disabled={changement.isPending}
        onClick={() => basculerVisibilite(champ)}
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      >
        <Icone aria-hidden="true" className="h-4 w-4" />
      </button>
    )
  }

  const decrireChamp = (idAide: string, idErreur: string, erreur?: string) =>
    erreur ? `${idAide} ${idErreur}` : idAide

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      animate={
        secousse && !reduireMouvement ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }
      }
      transition={{ duration: reduireMouvement ? 0 : 0.4 }}
      className="flex max-w-md flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${identifiant}-actuel`} requis>
          Mot de passe actuel
        </Label>
        <div className="relative">
          <Input
            id={`${identifiant}-actuel`}
            type={visibilite.actuel ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.mot_de_passe_actuel}
            aria-describedby={decrireChamp(
              `${identifiant}-aide-actuel`,
              `${identifiant}-erreur-actuel`,
              errors.mot_de_passe_actuel?.message,
            )}
            className="pr-11"
            {...register("mot_de_passe_actuel")}
          />
          {boutonVisibilite("actuel")}
        </div>
        <Link
          id={`${identifiant}-aide-actuel`}
          to="/mot-de-passe-oublie"
          className="self-start text-[0.85rem] text-[var(--color-brand)] underline-offset-4 hover:underline"
        >
          Mot de passe oublié ?
        </Link>
        {errors.mot_de_passe_actuel && (
          <p
            id={`${identifiant}-erreur-actuel`}
            className="text-sm text-destructive"
          >
            {errors.mot_de_passe_actuel.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${identifiant}-nouveau`} requis>
          Nouveau mot de passe
        </Label>
        <div className="relative">
          <Input
            id={`${identifiant}-nouveau`}
            type={visibilite.nouveau ? "text" : "password"}
            autoComplete="new-password"
            maxLength={72}
            aria-invalid={!!errors.nouveau_mot_de_passe}
            aria-describedby={decrireChamp(
              `${identifiant}-aide-nouveau`,
              `${identifiant}-erreur-nouveau`,
              errors.nouveau_mot_de_passe?.message,
            )}
            className="pr-11"
            {...register("nouveau_mot_de_passe")}
          />
          {boutonVisibilite("nouveau")}
        </div>
        <p
          id={`${identifiant}-aide-nouveau`}
          className="text-[0.85rem] text-[#6B7280]"
        >
          Au moins 8 caractères, une majuscule, une minuscule et un chiffre.
        </p>
        {errors.nouveau_mot_de_passe && (
          <p
            id={`${identifiant}-erreur-nouveau`}
            className="text-sm text-destructive"
          >
            {errors.nouveau_mot_de_passe.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${identifiant}-confirmation`} requis>
          Confirmer le nouveau mot de passe
        </Label>
        <div className="relative">
          <Input
            id={`${identifiant}-confirmation`}
            type={visibilite.confirmation ? "text" : "password"}
            autoComplete="new-password"
            maxLength={72}
            aria-invalid={!!errors.confirmation_mot_de_passe}
            aria-describedby={decrireChamp(
              `${identifiant}-aide-confirmation`,
              `${identifiant}-erreur-confirmation`,
              errors.confirmation_mot_de_passe?.message,
            )}
            className="pr-11"
            {...register("confirmation_mot_de_passe")}
          />
          {boutonVisibilite("confirmation")}
        </div>
        <p
          id={`${identifiant}-aide-confirmation`}
          className="text-[0.85rem] text-[#6B7280]"
        >
          Les deux mots de passe doivent être identiques.
        </p>
        {errors.confirmation_mot_de_passe && (
          <p
            id={`${identifiant}-erreur-confirmation`}
            className="text-sm text-destructive"
          >
            {errors.confirmation_mot_de_passe.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={changement.isPending || !isValid}
        className="mt-2 self-start"
      >
        {changement.isPending && (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        )}
        Modifier le mot de passe
      </Button>
    </motion.form>
  )
}
