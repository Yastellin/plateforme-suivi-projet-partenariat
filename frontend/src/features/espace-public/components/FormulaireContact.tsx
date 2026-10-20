// src/features/espace-public/components/FormulaireContact.tsx
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import apiClient from "@/lib/api-client"

interface FormulaireContactValeurs {
  nom: string
  email: string
  telephone: string
  sujet: string
  message: string
}

// Formulaire de contact public (section 7.4 : "Contact" → formulaire
// avec validation temps reel → toast). Aucune authentification requise.
export function FormulaireContact() {
  const [valeurs, setValeurs] = useState<FormulaireContactValeurs>({
    nom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  })
  const [erreurs, setErreurs] = useState<Partial<Record<keyof FormulaireContactValeurs, string>>>({})

  const mutation = useMutation({
    mutationFn: (donnees: FormulaireContactValeurs) =>
      apiClient.post("/public/contact", donnees),
    onSuccess: () => {
      toast.success("Message envoyé avec succès !")
      setValeurs({ nom: "", email: "", telephone: "", sujet: "", message: "" })
      setErreurs({})
    },
    onError: (erreur: Error) => {
      toast.error(erreur.message || "Une erreur est survenue lors de l'envoi.")
    },
  })

  function valider(): boolean {
    const nouvellesErreurs: Partial<Record<keyof FormulaireContactValeurs, string>> = {}

    if (!valeurs.nom.trim() || valeurs.nom.trim().length < 2) {
      nouvellesErreurs.nom = "Le nom doit contenir au moins 2 caractères."
    }
    if (!valeurs.email.trim()) {
      nouvellesErreurs.email = "L'email est requis."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeurs.email)) {
      nouvellesErreurs.email = "L'adresse email n'est pas valide."
    }
    if (!valeurs.sujet.trim() || valeurs.sujet.trim().length < 3) {
      nouvellesErreurs.sujet = "Le sujet doit contenir au moins 3 caractères."
    }
    if (!valeurs.message.trim() || valeurs.message.trim().length < 10) {
      nouvellesErreurs.message = "Le message doit contenir au moins 10 caractères."
    }

    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  function gererSoumission(e: React.FormEvent) {
    e.preventDefault()
    if (!valider()) return
    mutation.mutate(valeurs)
  }

  function mettreAJour(champ: keyof FormulaireContactValeurs, valeur: string) {
    setValeurs((prev) => ({ ...prev, [champ]: valeur }))
    if (erreurs[champ]) {
      setErreurs((prev) => {
        const copie = { ...prev }
        delete copie[champ]
        return copie
      })
    }
  }

  return (
    <form onSubmit={gererSoumission} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nom">
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nom"
            value={valeurs.nom}
            onChange={(e) => mettreAJour("nom", e.target.value)}
            placeholder="Votre nom"
          />
          {erreurs.nom && <p className="text-xs text-destructive">{erreurs.nom}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={valeurs.email}
            onChange={(e) => mettreAJour("email", e.target.value)}
            placeholder="exemple@domaine.com"
          />
          {erreurs.email && <p className="text-xs text-destructive">{erreurs.email}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telephone">Téléphone (optionnel)</Label>
        <Input
          id="telephone"
          type="tel"
          autoComplete="tel"
          maxLength={20}
          value={valeurs.telephone}
          onChange={(e) => {
            // N'autorise que chiffres, +, espaces, tirets, parentheses
            const propre = e.target.value.replace(/[^0-9+\s()-]/g, "")
            mettreAJour("telephone", propre)
          }}
          placeholder="+261 34 00 000 00"
        />
        {erreurs.telephone && <p className="text-xs text-destructive">{erreurs.telephone}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sujet">
          Sujet <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sujet"
          value={valeurs.sujet}
          onChange={(e) => mettreAJour("sujet", e.target.value)}
          placeholder="Objet de votre message"
        />
        {erreurs.sujet && <p className="text-xs text-destructive">{erreurs.sujet}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="message"
          value={valeurs.message}
          onChange={(e) => mettreAJour("message", e.target.value)}
          placeholder="Décrivez votre demande..."
          rows={5}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {erreurs.message && <p className="text-xs text-destructive">{erreurs.message}</p>}
      </div>
      <Button type="submit" disabled={mutation.isPending} className="self-start">
        {mutation.isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send size={16} />
            Envoyer
          </>
        )}
      </Button>
    </form>
  )
}
