// src/features/espace-public/components/FormulaireContact.tsx
import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { AlertCircle, Building2, CheckCircle2, Copy, Loader2, Mail, MessageSquare, Phone, Send, Tag, User } from "lucide-react"
import apiClient from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { usePublicEtablissements } from "@/features/espace-public/api/usePublicEtablissements"
import {
  LIMITES_CONTACT,
  VALEURS_CONTACT_VIDES,
  filtrerSaisie,
  validerContact,
  type ChampContact,
  type ValeursContact,
} from "@/lib/validators/message-contact"

interface ConfirmationEnvoi {
  reference: string
}

// Formulaire de contact public (style maquette).
// - Pendant la frappe : les caracteres interdits n'entrent pas dans le champ,
//   et chaque champ est controle en direct des sa premiere saisie.
// - A l'envoi : une reference unique est attribuee au message et affichee
//   a l'expediteur pour un suivi.
export function FormulaireContact() {
  const [valeurs, setValeurs] = useState<ValeursContact>(VALEURS_CONTACT_VIDES)
  const [touches, setTouches] = useState<Partial<Record<ChampContact, boolean>>>({})
  const [tentativeEnvoi, setTentativeEnvoi] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationEnvoi | null>(null)

  const { data: etablissementsData } = usePublicEtablissements({ limit: 100 })
  const etablissements = etablissementsData?.data ?? []

  // Erreurs recalculees a chaque frappe, affichees des que le champ a ete touche.
  const erreurs = useMemo(() => validerContact(valeurs), [valeurs])
  const erreurAffichee = (champ: ChampContact) =>
    (touches[champ] || tentativeEnvoi) ? erreurs[champ] : undefined
  const champValide = (champ: ChampContact) =>
    Boolean(touches[champ]) && valeurs[champ].trim() !== "" && !erreurs[champ]

  const mutation = useMutation({
    mutationFn: async (donnees: ValeursContact) => {
      const reponse = await apiClient.post<{ reference: string }>("/public/contact", {
        nom: donnees.nom.trim(),
        email: donnees.email.trim(),
        telephone: donnees.telephone.trim() || undefined,
        sujet: donnees.sujet.trim(),
        message: donnees.message.trim(),
        etablissement_id: donnees.etablissement_id || undefined,
      })
      return reponse.data
    },
    onSuccess: (donnees) => {
      setConfirmation({ reference: donnees.reference })
      setValeurs(VALEURS_CONTACT_VIDES)
      setTouches({})
      setTentativeEnvoi(false)
      toast.success("Message envoyé", {
        description: `Référence : ${donnees.reference}`,
      })
    },
    onError: (erreur: Error) => {
      toast.error("Envoi impossible", {
        description: erreur.message || "Une erreur est survenue. Veuillez réessayer.",
      })
    },
  })

  function modifier(champ: ChampContact, saisie: string) {
    const valeur = filtrerSaisie(champ, saisie)
    setValeurs((prev) => ({ ...prev, [champ]: valeur }))
    setTouches((prev) => ({ ...prev, [champ]: true }))
  }

  function marquerTouche(champ: ChampContact) {
    setTouches((prev) => ({ ...prev, [champ]: true }))
  }

  function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setTentativeEnvoi(true)
    if (Object.keys(validerContact(valeurs)).length > 0) {
      toast.warning("Formulaire incomplet", {
        description: "Corrigez les champs signalés avant d'envoyer.",
      })
      return
    }
    mutation.mutate(valeurs)
  }

  async function copierReference() {
    if (!confirmation) return
    try {
      await navigator.clipboard.writeText(confirmation.reference)
      toast.success("Référence copiée")
    } catch {
      toast.error("Copie impossible", { description: "Recopiez la référence manuellement." })
    }
  }

  const compteurMessage = valeurs.message.trim().length
  const compteurSujet = valeurs.sujet.trim().length

  if (confirmation) {
    return (
      <div role="status" className="vt-confirm">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={20} aria-hidden="true" />
          <h3 style={{ fontSize: 18 }}>Message bien reçu</h3>
        </div>
        <p>
          Votre message a été transmis à l'équipe concernée. Conservez cette référence pour toute relance :
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <code
            style={{
              background: "#fff",
              padding: "8px 16px",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 18,
              letterSpacing: "0.08em",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            {confirmation.reference}
          </code>
          <button type="button" className="vt-btn vt-btn-ghost" onClick={copierReference}>
            <Copy size={16} aria-hidden="true" />
            Copier
          </button>
        </div>
        <div>
          <button type="button" className="vt-btn vt-btn-ghost" onClick={() => setConfirmation(null)}>
            Envoyer un autre message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={gererSoumission} noValidate className="vt-form">
      <div className="vt-two">
        <Champ
          id="contact-nom"
          label="Nom complet"
          icone={<User size={18} className="vt-fld-ico" aria-hidden="true" />}
          requis
          aide="Lettres, espaces, apostrophes et tirets uniquement"
          erreur={erreurAffichee("nom")}
          valide={champValide("nom")}
        >
          <input
            id="contact-nom"
            className="vt-fld-input"
            autoComplete="name"
            value={valeurs.nom}
            maxLength={LIMITES_CONTACT.nom.max}
            onChange={(e) => modifier("nom", e.target.value)}
            onBlur={() => marquerTouche("nom")}
            placeholder="Nom"
            aria-invalid={!!erreurAffichee("nom")}
          />
        </Champ>

        <Champ
          id="contact-email"
          label="Adresse e-mail"
          icone={<Mail size={18} className="vt-fld-ico" aria-hidden="true" />}
          requis
          erreur={erreurAffichee("email")}
          valide={champValide("email")}
        >
          <input
            id="contact-email"
            type="email"
            className="vt-fld-input"
            autoComplete="email"
            inputMode="email"
            value={valeurs.email}
            onChange={(e) => modifier("email", e.target.value)}
            onBlur={() => marquerTouche("email")}
            placeholder="Courriel"
            aria-invalid={!!erreurAffichee("email")}
          />
        </Champ>
      </div>

      <div className="vt-two">
        <Champ
          id="contact-telephone"
          label="Téléphone (facultatif)"
          icone={<Phone size={18} className="vt-fld-ico" aria-hidden="true" />}
          aide="Format 034 12 345 67 ou +261 34 12 345 67."
          erreur={erreurAffichee("telephone")}
          valide={champValide("telephone")}
        >
          <input
            id="contact-telephone"
            type="tel"
            className="vt-fld-input"
            autoComplete="tel"
            inputMode="tel"
            value={valeurs.telephone}
            maxLength={LIMITES_CONTACT.telephone.max}
            onChange={(e) => modifier("telephone", e.target.value)}
            onBlur={() => marquerTouche("telephone")}
            placeholder="Téléphone"
            aria-invalid={!!erreurAffichee("telephone")}
          />
        </Champ>

        <Champ
          id="contact-destinataire"
          label="Destinataire"
          icone={<Building2 size={18} className="vt-fld-ico" aria-hidden="true" />}
          aide="Par défaut : la Présidence"
        >
          <select
            id="contact-destinataire"
            className="vt-fld-input"
            value={valeurs.etablissement_id}
            onChange={(e) => modifier("etablissement_id", e.target.value)}
          >
            <option value="">Présidence de l'Université</option>
            {etablissements.map((etab) => (
              <option key={etab.id} value={etab.id}>
                {etab.nom}
                {etab.sigle ? ` (${etab.sigle})` : ""}
              </option>
            ))}
          </select>
        </Champ>
      </div>

      <Champ
        id="contact-sujet"
        label="Sujet"
        icone={<Tag size={18} className="vt-fld-ico" aria-hidden="true" />}
        requis
        aide="Pas de caractères < ou >"
        erreur={erreurAffichee("sujet")}
        valide={champValide("sujet")}
        compteur={`${compteurSujet}/${LIMITES_CONTACT.sujet.max}`}
      >
        <input
          id="contact-sujet"
          className="vt-fld-input"
          value={valeurs.sujet}
          maxLength={LIMITES_CONTACT.sujet.max}
          onChange={(e) => modifier("sujet", e.target.value)}
          onBlur={() => marquerTouche("sujet")}
          placeholder="Sujet"
          aria-invalid={!!erreurAffichee("sujet")}
        />
      </Champ>

      <Champ
        id="contact-message"
        label="Votre message"
        icone={<MessageSquare size={18} className="vt-fld-ico" aria-hidden="true" />}
        requis
        aide="Au moins 10 caractères."
        erreur={erreurAffichee("message")}
        valide={champValide("message")}
        compteur={`${compteurMessage}/${LIMITES_CONTACT.message.max}`}
      >
        <textarea
          id="contact-message"
          rows={6}
          className="vt-fld-input"
          value={valeurs.message}
          maxLength={LIMITES_CONTACT.message.max}
          onChange={(e) => modifier("message", e.target.value)}
          onBlur={() => marquerTouche("message")}
          placeholder="Message"
          aria-invalid={!!erreurAffichee("message")}
        />
      </Champ>

      <div className="vt-form-foot" style={{ justifyContent: "space-between" }}>
        <p className="vt-note">
          <span style={{ color: "var(--err)" }}>*</span> Champs obligatoires. Vos données ne servent qu'à traiter votre demande.
        </p>
        <button type="submit" className="vt-btn vt-btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
          {mutation.isPending ? "Envoi en cours…" : "Envoyer le message"}
        </button>
      </div>
    </form>
  )
}

interface ChampProps {
  id: string
  label: string
  children: ReactNode
  icone?: ReactNode
  requis?: boolean
  aide?: string
  erreur?: string
  valide?: boolean
  compteur?: string
}

// Champ a libelle flottant (maquette) : le libelle remonte a la saisie ou au focus.
// Le libelle est place apres le champ pour que les selecteurs frere (+) fonctionnent.
function Champ({ id, label, children, icone, requis, aide, erreur, valide, compteur }: ChampProps) {
  return (
    <div className={cn("vt-fld", erreur && "vt-bad", !erreur && valide && "vt-good")}>
      {icone}
      {children}
      <label htmlFor={id} className="vt-fld-label">
        {label}
        {requis && <span style={{ color: "var(--err)", marginLeft: 2 }}>*</span>}
        {valide && <CheckCircle2 size={14} aria-label="Champ valide" style={{ display: "inline", marginLeft: 6, color: "var(--brand)" }} />}
      </label>
      <div className="vt-help" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {erreur ? (
          <span id={`${id}-erreur`} role="alert" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <AlertCircle size={12} aria-hidden="true" />
            {erreur}
          </span>
        ) : (
          <span>{aide}</span>
        )}
        {compteur && <span style={{ fontVariantNumeric: "tabular-nums", flex: "none" }}>{compteur}</span>}
      </div>
    </div>
  )
}
