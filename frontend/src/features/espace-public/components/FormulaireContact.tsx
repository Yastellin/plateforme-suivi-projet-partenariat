// src/features/espace-public/components/FormulaireContact.tsx
import { useMemo, useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Send, Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

// Formulaire de contact public.
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
      <div role="status" className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 size={20} />
          <h3 className="font-heading text-lg font-semibold">Message bien reçu</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Votre message a été transmis à l'équipe concernée. Conservez cette référence pour toute relance :
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="rounded-md bg-background px-4 py-2 font-mono text-lg tracking-wider text-foreground ring-1 ring-border">
            {confirmation.reference}
          </code>
          <Button type="button" variant="outline" onClick={copierReference} className="rounded-full">
            <Copy size={16} />
            Copier
          </Button>
        </div>
        <div>
          <Button type="button" variant="ghost" onClick={() => setConfirmation(null)} className="px-0">
            Envoyer un autre message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={gererSoumission} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ
          id="contact-nom"
          label="Nom complet"
          requis
          aide="Lettres, espaces, apostrophes et tirets uniquement"
          erreur={erreurAffichee("nom")}
          valide={champValide("nom")}
        >
          <Input
            className="vt-input"
            id="contact-nom"
            autoComplete="name"
            value={valeurs.nom}
            maxLength={LIMITES_CONTACT.nom.max}
            onChange={(e) => modifier("nom", e.target.value)}
            onBlur={() => marquerTouche("nom")}
            placeholder="Votre nom"
            aria-invalid={!!erreurAffichee("nom")}
          />
        </Champ>

        <Champ id="contact-email" label="Adresse e-mail" requis erreur={erreurAffichee("email")} valide={champValide("email")}>
          <Input
            className="vt-input"
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={valeurs.email}
            onChange={(e) => modifier("email", e.target.value)}
            onBlur={() => marquerTouche("email")}
            placeholder="exemple@domaine.mg"
            aria-invalid={!!erreurAffichee("email")}
          />
        </Champ>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ
          id="contact-telephone"
          label="Téléphone"
          aide="Facultatif — format international, ex. +261 34 22 330 54"
          erreur={erreurAffichee("telephone")}
          valide={champValide("telephone")}
        >
          <Input
            className="vt-input"
            id="contact-telephone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={valeurs.telephone}
            maxLength={LIMITES_CONTACT.telephone.max}
            onChange={(e) => modifier("telephone", e.target.value)}
            onBlur={() => marquerTouche("telephone")}
            placeholder="+261 34 00 000 00"
            aria-invalid={!!erreurAffichee("telephone")}
          />
        </Champ>

        <Champ id="contact-destinataire" label="Destinataire" aide="Par défaut : la Présidence">
          <select
            id="contact-destinataire"
            value={valeurs.etablissement_id}
            onChange={(e) => modifier("etablissement_id", e.target.value)}
            className="vt-input"
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
        requis
        aide="Pas de caractères < ou >"
        erreur={erreurAffichee("sujet")}
        valide={champValide("sujet")}
        compteur={`${compteurSujet}/${LIMITES_CONTACT.sujet.max}`}
      >
        <Input
          className="vt-input"
          id="contact-sujet"
          value={valeurs.sujet}
          maxLength={LIMITES_CONTACT.sujet.max}
          onChange={(e) => modifier("sujet", e.target.value)}
          onBlur={() => marquerTouche("sujet")}
          placeholder="Objet de votre message"
          aria-invalid={!!erreurAffichee("sujet")}
        />
      </Champ>

      <Champ
        id="contact-message"
        label="Message"
        requis
        erreur={erreurAffichee("message")}
        valide={champValide("message")}
        compteur={`${compteurMessage}/${LIMITES_CONTACT.message.max}`}
      >
        <Textarea
          className="vt-input vt-input-area"
          id="contact-message"
          rows={6}
          value={valeurs.message}
          maxLength={LIMITES_CONTACT.message.max}
          onChange={(e) => modifier("message", e.target.value)}
          onBlur={() => marquerTouche("message")}
          placeholder="Décrivez votre demande (10 caractères minimum)…"
          aria-invalid={!!erreurAffichee("message")}
        />
      </Champ>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Champs obligatoires. Vos données ne servent qu'à traiter votre demande.
        </p>
        <Button type="submit" disabled={mutation.isPending} className="rounded-full px-6">
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {mutation.isPending ? "Envoi en cours…" : "Envoyer le message"}
        </Button>
      </div>
    </form>
  )
}

interface ChampProps {
  id: string
  label: string
  children: React.ReactNode
  requis?: boolean
  aide?: string
  erreur?: string
  valide?: boolean
  compteur?: string
}

// Enveloppe commune : champ a libelle flottant (le libelle descend dans le champ
// a la saisie ou au focus), message d'aide ou erreur en direct, compteur.
function Champ({ id, label, children, requis, aide, erreur, valide, compteur }: ChampProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="vt-field">
        {children}
        <Label htmlFor={id} className="vt-float-label">
          {label}
          {requis && <span className="ml-0.5 text-destructive">*</span>}
          {valide && <CheckCircle2 size={14} aria-label="Champ valide" className="ml-1.5 inline text-primary" />}
        </Label>
      </div>
      <div className="flex items-start justify-between gap-2 px-1">
        {erreur ? (
          <p id={`${id}-erreur`} role="alert" className={cn("flex items-center gap-1 text-xs text-destructive")}>
            <AlertCircle size={12} />
            {erreur}
          </p>
        ) : (
          aide ? <p className="text-xs text-muted-foreground">{aide}</p> : <span />
        )}
        {compteur && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{compteur}</span>}
      </div>
    </div>
  )
}
