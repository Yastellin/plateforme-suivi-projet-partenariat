// src/features/espace-public/components/FormulaireContact.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api-client";
import {
  filtrerSaisie,
  validerContact,
  type ChampContact,
} from "@/lib/validators/message-contact";

interface FormulaireContactValeurs {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
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
  });
  const [champsTouches, setChampsTouches] = useState<
    Partial<Record<keyof FormulaireContactValeurs, boolean>>
  >({});
  const [soumissionTentee, setSoumissionTentee] = useState(false);
  const erreurs = validerContact({ ...valeurs, etablissement_id: "" });
  const formulaireValide = Object.keys(erreurs).length === 0;

  const mutation = useMutation({
    mutationFn: (donnees: FormulaireContactValeurs) =>
      apiClient.post("/public/contact", donnees),
    onSuccess: () => {
      toast.success("Message envoyé avec succès !");
      setValeurs({ nom: "", email: "", telephone: "", sujet: "", message: "" });
      setChampsTouches({});
      setSoumissionTentee(false);
    },
    onError: (erreur: Error) => {
      toast.error(erreur.message || "Une erreur est survenue lors de l'envoi.");
    },
  });

  function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setSoumissionTentee(true);
    if (!formulaireValide) return;
    mutation.mutate(valeurs);
  }

  function mettreAJour(champ: keyof FormulaireContactValeurs, valeur: string) {
    setValeurs((precedentes) => ({
      ...precedentes,
      [champ]: filtrerSaisie(champ as ChampContact, valeur),
    }));
  }

  function marquerTouche(champ: keyof FormulaireContactValeurs) {
    setChampsTouches((precedents) => ({ ...precedents, [champ]: true }));
  }

  function erreurVisible(champ: keyof FormulaireContactValeurs) {
    return champsTouches[champ] || soumissionTentee
      ? erreurs[champ]
      : undefined;
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
            onBlur={() => marquerTouche("nom")}
            aria-invalid={Boolean(erreurVisible("nom"))}
            placeholder="Rakoto Soa"
          />
          {erreurVisible("nom") ? (
            <p className="text-xs text-destructive">{erreurVisible("nom")}</p>
          ) : null}
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
            onBlur={() => marquerTouche("email")}
            aria-invalid={Boolean(erreurVisible("email"))}
            placeholder="rakoto.soa@univ-toliara.mg"
          />
          {erreurVisible("email") ? (
            <p className="text-xs text-destructive">{erreurVisible("email")}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telephone">Téléphone (optionnel)</Label>
        <Input
          id="telephone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          value={valeurs.telephone}
          onChange={(e) => mettreAJour("telephone", e.target.value)}
          onBlur={() => marquerTouche("telephone")}
          aria-invalid={Boolean(erreurVisible("telephone"))}
          placeholder="+261 34 22 330 54"
        />
        {erreurVisible("telephone") ? (
          <p className="text-xs text-destructive">
            {erreurVisible("telephone")}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sujet">
          Sujet <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sujet"
          value={valeurs.sujet}
          onChange={(e) => mettreAJour("sujet", e.target.value)}
          onBlur={() => marquerTouche("sujet")}
          aria-invalid={Boolean(erreurVisible("sujet"))}
          placeholder="Proposition de partenariat universitaire"
        />
        {erreurVisible("sujet") ? (
          <p className="text-xs text-destructive">{erreurVisible("sujet")}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="message"
          value={valeurs.message}
          onChange={(e) => mettreAJour("message", e.target.value)}
          onBlur={() => marquerTouche("message")}
          aria-invalid={Boolean(erreurVisible("message"))}
          placeholder="Décrivez votre proposition pour l'Université de Toliara..."
          rows={5}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {erreurVisible("message") ? (
          <p className="text-xs text-destructive">{erreurVisible("message")}</p>
        ) : null}
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending || !formulaireValide}
        className="self-start"
      >
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
  );
}
