// src/features/espace-public/components/FormulaireContact.tsx
import { useMemo, useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Send, Loader2, AlertCircle } from "lucide-react"
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
  validerContact,
  type ChampContact,
  type ValeursContact,
} from "@/lib/validators/message-contact"

// Formulaire de contact public. Les regles de saisie sont verifiees pendant
// la frappe (une fois le champ touche) et a l'envoi. Le message est transmis
// a la Presidence, ou directement a l'etablissement choisi.
export function FormulaireContact() {
  const [valeurs, setValeurs] = useState<ValeursContact>(VALEURS_CONTACT_VIDES)
  const [touches, setTouches] = useState<Partial<Record<ChampContact, boolean>>>({})
  const [tentativeEnvoi, setTentativeEnvoi] = useState(false)

  const { data: etablissementsData } = usePublicEtablissements({ limit: 100 })
  const etablissements = etablissementsData?.data ?? []

  // Erreurs recalculees a chaque frappe ; affichees seulement apres interaction.
  const erreurs = useMemo(() => validerContact(valeurs), [valeurs])
  const erreurAffichee = (champ: ChampContact) =>
    (touches[champ] || tentativeEnvoi) ? erreurs[champ] : undefined

  const mutation = useMutation({
    mutationFn: (donnees: ValeursContact) =>
      apiClient.post("/public/contact", {
        nom: donnees.nom.trim(),
        email: donnees.email.trim(),
        telephone: donnees.telephone.trim() || undefined,
        sujet: donnees.sujet.trim(),
        message: donnees.message.trim(),
        etablissement_id: donnees.etablissement_id || undefined,
      }),
    onSuccess: () => {
      toast.success("Message envoyé", {
        description: "Merci. Votre message a bien été transmis à l'équipe concernée.",
      })
      setValeurs(VALEURS_CONTACT_VIDES)
      setTouches({})
      setTentativeEnvoi(false)
    },
    onError: (erreur: Error) => {
      toast.error("Envoi impossible", {
        description: erreur.message || "Une erreur est survenue. Veuillez réessayer.",
      })
    },
  })

  function modifier(champ: ChampContact, valeur: string) {
    setValeurs((prev) => ({ ...prev, [champ]: valeur }))
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

  const compteurMessage = valeurs.message.trim().length
  const compteurSujet = valeurs.sujet.trim().length

  return (
    <form onSubmit={gererSoumission} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ id="contact-nom" label="Nom complet" requis erreur={erreurAffichee("nom")}>
          <Input
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

        <Champ id="contact-email" label="Adresse e-mail" requis erreur={erreurAffichee("email")}>
          <Input
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
        <Champ id="contact-telephone" label="Téléphone" aide="Facultatif — format international conseillé" erreur={erreurAffichee("telephone")}>
          <Input
            id="contact-telephone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={valeurs.telephone}
            maxLength={30}
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
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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

      <Champ id="contact-sujet" label="Sujet" requis erreur={erreurAffichee("sujet")} compteur={`${compteurSujet}/${LIMITES_CONTACT.sujet.max}`}>
        <Input
          id="contact-sujet"
          value={valeurs.sujet}
          maxLength={LIMITES_CONTACT.sujet.max}
          onChange={(e) => modifier("sujet", e.target.value)}
          onBlur={() => marquerTouche("sujet")}
          placeholder="Objet de votre message"
          aria-invalid={!!erreurAffichee("sujet")}
        />
      </Champ>

      <Champ id="contact-message" label="Message" requis erreur={erreurAffichee("message")} compteur={`${compteurMessage}/${LIMITES_CONTACT.message.max}`}>
        <Textarea
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
  compteur?: string
}

// Enveloppe commune : libelle, aide, message d'erreur et compteur.
function Champ({ id, label, children, requis, aide, erreur, compteur }: ChampProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="font-medium">
          {label}
          {requis && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {compteur && <span className="text-xs tabular-nums text-muted-foreground">{compteur}</span>}
      </div>
      {children}
      {erreur ? (
        <p id={`${id}-erreur`} role="alert" className={cn("flex items-center gap-1 text-xs text-destructive")}>
          <AlertCircle size={12} />
          {erreur}
        </p>
      ) : (
        aide && <p className="text-xs text-muted-foreground">{aide}</p>
      )}
    </div>
  )
}

