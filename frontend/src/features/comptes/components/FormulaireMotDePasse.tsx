// src/features/comptes/components/FormulaireMotDePasse.tsx
import { useId, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, useReducedMotion } from "framer-motion"
import { Check, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import {
  LONGUEUR_MAX_MOT_DE_PASSE,
  LONGUEUR_MIN_MOT_DE_PASSE,
} from "@/lib/validators/mot-de-passe.schema"
import {
  schemaChangerMotDePasse,
  type ChangerMotDePasseFormValues,
} from "@/lib/validators/compte.schema"
import { useChangerMotDePasse } from "@/features/comptes/api/useChangerMotDePasse"
import { cn } from "@/lib/utils"

type ChampMotDePasse = "actuel" | "nouveau" | "confirmation"

// Mêmes critères que le schéma de validation, affichés en direct.
const REGLES = [
  {
    cle: "longueur",
    libelle: `${LONGUEUR_MIN_MOT_DE_PASSE} à ${LONGUEUR_MAX_MOT_DE_PASSE} caractères`,
    verifie: (valeur: string) =>
      valeur.length >= LONGUEUR_MIN_MOT_DE_PASSE &&
      valeur.length <= LONGUEUR_MAX_MOT_DE_PASSE,
  },
  {
    cle: "majuscule",
    libelle: "Une majuscule",
    verifie: (valeur: string) => /[A-Z]/.test(valeur),
  },
  {
    cle: "minuscule",
    libelle: "Une minuscule",
    verifie: (valeur: string) => /[a-z]/.test(valeur),
  },
  {
    cle: "chiffre",
    libelle: "Un chiffre",
    verifie: (valeur: string) => /\d/.test(valeur),
  },
] as const

const CLASSE_CHAMP =
  "h-10 w-full rounded-xl border bg-white px-3.5 pr-11 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 disabled:opacity-60 dark:bg-white/5 dark:text-slate-100"

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
    control,
    formState: { errors, isValid },
  } = useForm<ChangerMotDePasseFormValues>({
    resolver: zodResolver(schemaChangerMotDePasse),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const nouveau =
    useWatch({ control, name: "nouveau_mot_de_passe" }) ?? ""
  const confirmation =
    useWatch({ control, name: "confirmation_mot_de_passe" }) ?? ""
  const reglesRespectees = REGLES.filter((regle) => regle.verifie(nouveau))
  const nombreReglesRespectees = reglesRespectees.length
  const correspondance =
    confirmation === ""
      ? "vide"
      : nouveau === confirmation
        ? "identiques"
        : "differents"

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
        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <Icone aria-hidden="true" className="h-4 w-4" />
      </button>
    )
  }

  const decrireChamp = (idAide: string, idErreur: string, erreur?: string) =>
    erreur ? `${idAide} ${idErreur}` : idAide

  const idAideActuel = `${identifiant}-aide-actuel`
  const idAideNouveau = `${identifiant}-aide-nouveau`
  const idAideConfirmation = `${identifiant}-aide-confirmation`
  const idErreurActuel = `${identifiant}-erreur-actuel`
  const idErreurNouveau = `${identifiant}-erreur-nouveau`
  const idErreurConfirmation = `${identifiant}-erreur-confirmation`

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      animate={
        secousse && !reduireMouvement ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }
      }
      transition={{ duration: reduireMouvement ? 0 : 0.4 }}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Mot de passe actuel */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${identifiant}-actuel`}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Mot de passe actuel <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id={`${identifiant}-actuel`}
            type={visibilite.actuel ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.mot_de_passe_actuel}
            aria-describedby={decrireChamp(
              idAideActuel,
              idErreurActuel,
              errors.mot_de_passe_actuel?.message,
            )}
            className={cn(
              CLASSE_CHAMP,
              errors.mot_de_passe_actuel
                ? "border-red-500 dark:border-red-400"
                : "border-slate-300 dark:border-white/10",
            )}
            {...register("mot_de_passe_actuel")}
          />
          {boutonVisibilite("actuel")}
        </div>
        <Link
          id={idAideActuel}
          to="/mot-de-passe-oublie"
          className="self-start text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Mot de passe oublié ?
        </Link>
        {errors.mot_de_passe_actuel && (
          <p
            id={idErreurActuel}
            className="text-xs text-red-600 dark:text-red-400"
          >
            {errors.mot_de_passe_actuel.message}
          </p>
        )}
      </div>

      {/* Nouveau mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${identifiant}-nouveau`}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Nouveau mot de passe <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id={`${identifiant}-nouveau`}
            type={visibilite.nouveau ? "text" : "password"}
            autoComplete="new-password"
            maxLength={72}
            aria-invalid={!!errors.nouveau_mot_de_passe}
            aria-describedby={decrireChamp(
              idAideNouveau,
              idErreurNouveau,
              errors.nouveau_mot_de_passe?.message,
            )}
            className={cn(
              CLASSE_CHAMP,
              errors.nouveau_mot_de_passe
                ? "border-red-500 dark:border-red-400"
                : "border-slate-300 dark:border-white/10",
            )}
            {...register("nouveau_mot_de_passe")}
          />
          {boutonVisibilite("nouveau")}
        </div>

        {/* Force : un segment par règle, ambre sous 3 règles, vert à partir de 3 */}
        <div
          className="mt-1 flex gap-1.5"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index < nombreReglesRespectees
                  ? nombreReglesRespectees < 3
                    ? "bg-amber-500"
                    : "bg-emerald-600"
                  : "bg-slate-200 dark:bg-white/10",
              )}
            />
          ))}
        </div>

        <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {REGLES.map((regle) => {
            const respectee = regle.verifie(nouveau)
            return (
              <li
                key={regle.cle}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  respectee
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                    respectee
                      ? "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                      : "border-slate-300 dark:border-white/20",
                  )}
                >
                  {respectee ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                {regle.libelle}
              </li>
            )
          })}
        </ul>

        <p id={idAideNouveau} className="sr-only">
          Au moins 8 caractères, une majuscule, une minuscule et un chiffre.
        </p>
        {errors.nouveau_mot_de_passe && (
          <p
            id={idErreurNouveau}
            className="text-xs text-red-600 dark:text-red-400"
          >
            {errors.nouveau_mot_de_passe.message}
          </p>
        )}
      </div>

      {/* Confirmation */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${identifiant}-confirmation`}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Confirmer le nouveau mot de passe <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id={`${identifiant}-confirmation`}
            type={visibilite.confirmation ? "text" : "password"}
            autoComplete="new-password"
            maxLength={72}
            aria-invalid={!!errors.confirmation_mot_de_passe}
            aria-describedby={decrireChamp(
              idAideConfirmation,
              idErreurConfirmation,
              errors.confirmation_mot_de_passe?.message,
            )}
            className={cn(
              CLASSE_CHAMP,
              errors.confirmation_mot_de_passe
                ? "border-red-500 dark:border-red-400"
                : "border-slate-300 dark:border-white/10",
            )}
            {...register("confirmation_mot_de_passe")}
          />
          {boutonVisibilite("confirmation")}
        </div>

        <p
          role="status"
          className={cn(
            "text-xs",
            correspondance === "identiques" &&
              "text-emerald-700 dark:text-emerald-300",
            correspondance === "differents" &&
              "text-red-600 dark:text-red-400",
            correspondance === "vide" && "text-slate-500 dark:text-slate-400",
          )}
        >
          {correspondance === "identiques"
            ? "Les mots de passe correspondent."
            : correspondance === "differents"
              ? "Les mots de passe ne correspondent pas."
              : "Les deux mots de passe doivent être identiques."}
        </p>
        {/* Message d'erreur du schéma : lu par les lecteurs d'écran, sans doublon visuel */}
        <p id={idAideConfirmation} className="sr-only">
          Les deux mots de passe doivent être identiques.
        </p>
        {errors.confirmation_mot_de_passe && (
          <p id={idErreurConfirmation} className="sr-only">
            {errors.confirmation_mot_de_passe.message}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={changement.isPending || !isValid}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {changement.isPending && (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Modifier le mot de passe
        </button>
      </div>
    </motion.form>
  )
}
