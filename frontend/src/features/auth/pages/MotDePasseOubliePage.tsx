// src/features/auth/pages/MotDePasseOubliePage.tsx

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react"
import { toast } from "sonner"

import { FloatingLabelInput } from "@/components/forms/inputs/FloatingLabelInput"
import {
  motDePasseOublieSchema,
  type MotDePasseOublieFormValues,
} from "@/lib/validators/mot-de-passe.schema"
import { useBlocageTemporaire } from "@/hooks/useBlocageTemporaire"
import { useMotDePasseOublie } from "@/features/auth/api/useMotDePasseOublie"
import { LayoutAuthentification } from "@/features/auth/components/LayoutAuthentification"

const MESSAGE_CONFIRMATION =
  "Si un compte est associé à cette adresse, un lien de réinitialisation vient d'être envoyé. Il n'est utilisable qu'une seule fois et expire rapidement."

const CLASSE_BOUTON_PRIMAIRE =
  "flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-[11px] text-[13.5px] font-semibold text-white transition-colors hover:border-[var(--color-brand-hover)] hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-70"

export function MotDePasseOubliePage() {
  const demande = useMotDePasseOublie()
  const { secondesRestantes, bloque, bloquer, estTropDeRequetes } = useBlocageTemporaire()
  const [adresseConfirmee, setAdresseConfirmee] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<MotDePasseOublieFormValues>({
    resolver: zodResolver(motDePasseOublieSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  })

  function onSubmit(valeurs: MotDePasseOublieFormValues) {
    demande.mutate(valeurs.email, {
      onSuccess: () => setAdresseConfirmee(valeurs.email),
      onError: (erreur) => {
        if (estTropDeRequetes(erreur.message)) {
          bloquer()
          toast.error("Trop de demandes", {
            description: "Veuillez patienter avant de demander un nouveau lien.",
          })
          return
        }

        if (erreur.message.includes("réseau")) {
          toast.error("Envoi impossible", {
            description: "Vérifiez votre connexion puis réessayez.",
          })
          return
        }

        // Reponse volontairement identique que l'e-mail existe ou non.
        setAdresseConfirmee(getValues("email"))
      },
    })
  }

  const boutonBloque = demande.isPending || bloque || !isValid

  return (
    <LayoutAuthentification
      titre="Mot de passe oublié"
      description="Recevez un lien de réinitialisation par e-mail."
    >
      {adresseConfirmee ? (
        <div>
          <div className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--status-actif-bg)] px-4 py-3.5">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-actif-fg)]" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--status-actif-fg)]">Demande enregistrée</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {MESSAGE_CONFIRMATION}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Adresse utilisée : <span className="font-medium text-[var(--color-text-primary)]">{adresseConfirmee}</span>
          </p>

          <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Aucun message reçu ? Vérifiez le dossier des courriers indésirables, puis relancez la demande.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAdresseConfirmee(null)}
              disabled={boutonBloque}
              className={CLASSE_BOUTON_PRIMAIRE}
            >
              {demande.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {secondesRestantes > 0 ? `Réessayez dans ${secondesRestantes}s` : "Renvoyer un lien"}
            </button>

            <Link
              to="/connexion"
              className="flex items-center justify-center gap-2 text-[12.5px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FloatingLabelInput
            label="Adresse e-mail"
            requis
            type="email"
            autoComplete="email"
            autoFocus
            icone={<Mail />}
            placeholder="prenom.nom@univ-fianarantsoa.mg"
            aide="Utilisez l'adresse rattachée à votre compte."
            erreur={errors.email?.message}
            {...register("email")}
          />

          <button type="submit" disabled={boutonBloque} className={`${CLASSE_BOUTON_PRIMAIRE} mb-4`}>
            {demande.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {secondesRestantes > 0
              ? `Réessayez dans ${secondesRestantes}s`
              : demande.isPending
                ? "Envoi en cours…"
                : "Envoyer le lien"}
          </button>

          <Link
            to="/connexion"
            className="flex items-center justify-center gap-2 text-[12.5px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </form>
      )}
    </LayoutAuthentification>
  )
}
