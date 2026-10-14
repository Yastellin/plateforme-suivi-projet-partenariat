// src/features/auth/pages/ResetPasswordPage.tsx

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, Loader2, Lock, ShieldAlert, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { PasswordInput } from "@/components/forms/inputs/PasswordInput"
import {
  AIDE_MOT_DE_PASSE,
  reinitialiserMotDePasseSchema,
  type ReinitialiserMotDePasseFormValues,
} from "@/lib/validators/mot-de-passe.schema"
import { useBlocageTemporaire } from "@/hooks/useBlocageTemporaire"
import { useReinitialiserMotDePasse } from "@/features/auth/api/useReinitialiserMotDePasse"
import { LayoutAuthentification } from "@/features/auth/components/LayoutAuthentification"
import { ReglesMotDePasse } from "@/features/auth/components/ReglesMotDePasse"
import { libelleErreurToken } from "@/features/auth/lib/libelles-erreur-token"

const CLASSE_BOUTON_PRIMAIRE =
  "flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-[11px] text-[13.5px] font-semibold text-white transition-colors hover:border-[var(--color-brand-hover)] hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-70"

const CLASSE_LIEN_RETOUR =
  "flex items-center justify-center gap-2 text-[12.5px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] hover:underline"

function Panneau({ ton, titre, message }: { ton: "succes" | "erreur"; titre: string; message: string }) {
  const Icone = ton === "succes" ? CheckCircle2 : ShieldAlert

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Icone
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            ton === "succes" ? "text-[var(--status-actif-fg)]" : "text-[var(--status-attente-fg)]"
          }`}
        />
        <div>
          <p className="text-[14px] font-bold">{titre}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">{message}</p>
        </div>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const [parametres] = useSearchParams()
  const token = parametres.get("token") ?? ""
  const reinitialisation = useReinitialiserMotDePasse()
  const { secondesRestantes, bloque, bloquer, estTropDeRequetes } = useBlocageTemporaire()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReinitialiserMotDePasseFormValues>({
    resolver: zodResolver(reinitialiserMotDePasseSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { nouveauMotDePasse: "", confirmationMotDePasse: "" },
  })

  const nouveauMotDePasse = watch("nouveauMotDePasse")

  function onSubmit(valeurs: ReinitialiserMotDePasseFormValues) {
    reinitialisation.mutate(
      { token, nouveauMotDePasse: valeurs.nouveauMotDePasse },
      {
        onSuccess: () => {
          toast.success("Mot de passe modifié", {
            description: "Vous pouvez vous connecter avec votre nouveau mot de passe.",
          })
        },
        onError: (erreur) => {
          if (estTropDeRequetes(erreur.message)) {
            bloquer()
          }
        },
      },
    )
  }

  if (!token) {
    return (
      <LayoutAuthentification
        titre="Lien incomplet"
        description="Le lien de réinitialisation n'a pas été reconnu."
      >
        <Panneau
          ton="erreur"
          titre="Lien incomplet ou tronqué"
          message="Ouvrez le lien tel qu'il figure dans l'e-mail de réinitialisation, ou demandez un nouveau lien."
        />
        <Link to="/mot-de-passe-oublie" className={`${CLASSE_LIEN_RETOUR} mt-6`}>
          <Lock className="h-3.5 w-3.5" />
          Demander un nouveau lien
        </Link>
      </LayoutAuthentification>
    )
  }

  if (reinitialisation.isSuccess) {
    return (
      <LayoutAuthentification
        titre="Mot de passe modifié"
        description="Votre nouveau mot de passe est actif."
      >
        <Panneau
          ton="succes"
          titre="Réinitialisation terminée"
          message="Toutes les sessions ouvertes avec l'ancien mot de passe ont été déconnectées. Ce lien n'est plus utilisable."
        />
        <Link to="/connexion" className={`${CLASSE_BOUTON_PRIMAIRE} mt-6`}>
          Se connecter
        </Link>
      </LayoutAuthentification>
    )
  }

  const erreurToken =
    reinitialisation.isError && !estTropDeRequetes(reinitialisation.error.message)
      ? libelleErreurToken(reinitialisation.error.message)
      : null
  const boutonBloque = reinitialisation.isPending || bloque

  return (
    <LayoutAuthentification
      titre="Nouveau mot de passe"
      description="Définissez le mot de passe qui remplacera l'ancien."
    >
      {erreurToken ? (
        <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--status-attente-bg)] bg-[var(--status-attente-bg)] px-4 py-3.5">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-attente-fg)]" />
          <div>
            <p className="text-[12.5px] font-semibold text-[var(--status-attente-fg)]">
              Ce lien ne peut plus être utilisé
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
              {erreurToken}
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordInput
          label="Nouveau mot de passe"
          requis
          autoFocus
          autoComplete="new-password"
          aide={AIDE_MOT_DE_PASSE}
          erreur={errors.nouveauMotDePasse?.message}
          disabled={boutonBloque}
          {...register("nouveauMotDePasse")}
        />

        <ReglesMotDePasse valeur={nouveauMotDePasse} />

        <div className="mt-5">
          <PasswordInput
            label="Confirmation du mot de passe"
            requis
            autoComplete="new-password"
            erreur={errors.confirmationMotDePasse?.message}
            disabled={boutonBloque}
            {...register("confirmationMotDePasse")}
          />
        </div>

        <button type="submit" disabled={boutonBloque} className={`${CLASSE_BOUTON_PRIMAIRE} mb-4`}>
          {reinitialisation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          {secondesRestantes > 0
            ? `Réessayez dans ${secondesRestantes}s`
            : reinitialisation.isPending
              ? "Enregistrement en cours…"
              : "Définir le mot de passe"}
        </button>

        <Link to="/connexion" className={CLASSE_LIEN_RETOUR}>
          Retour à la connexion
        </Link>
      </form>
    </LayoutAuthentification>
  )
}
