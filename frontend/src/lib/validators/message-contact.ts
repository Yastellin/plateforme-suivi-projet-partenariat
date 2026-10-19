// src/lib/validators/message-contact.ts
//
// Regles de saisie du formulaire de contact public. Elles reprennent
// exactement celles de CreateMessageContactDto (backend) : le serveur reste
// la reference, ces controles evitent un aller-retour inutile a l'utilisateur.
//
// Deux niveaux :
//  - filtrerSaisie : pendant la frappe, les caracteres interdits n'entrent
//    pas dans le champ (ex. un chiffre dans le nom) ;
//  - validerChampContact : verifie la valeur complete, en direct.

import { normaliserTelephone } from "@/lib/phone"

export const LIMITES_CONTACT = {
  nom: { min: 2, max: 100 },
  email: { max: 254 },
  telephone: { max: 30 },
  sujet: { min: 3, max: 200 },
  message: { min: 10, max: 2000 },
} as const

export interface ValeursContact {
  nom: string
  email: string
  telephone: string
  sujet: string
  message: string
  etablissement_id: string
}

export type ChampContact = keyof ValeursContact
export type ErreursContact = Partial<Record<ChampContact, string>>

export const VALEURS_CONTACT_VIDES: ValeursContact = {
  nom: "",
  email: "",
  telephone: "",
  sujet: "",
  message: "",
  etablissement_id: "",
}

// Memes expressions que backend/src/messages-contact/dto/regles-saisie.ts
const REGEX_NOM = /^[\p{L}\p{M}' .-]+$/u
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REGEX_TELEPHONE_CARACTERES = /^\+?[0-9\s().-]*$/
const REGLE_SANS_BALISES = /^[^<>]*$/
// Detection volontaire des caracteres de controle invisibles.
// oxlint-disable-next-line no-control-regex
const REGLE_SANS_CONTROLE = /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/
const REGLE_SANS_REPETITION = /^(?![\s\S]*([\s\S])\1{9,})[\s\S]*$/
const REGLE_CONTENU_REEL = /^(?:[^\p{L}\p{N}]*[\p{L}\p{N}]){3,}[\s\S]*$/u

// Retire, a la frappe, les caracteres qu'un champ ne peut pas contenir.
export function filtrerSaisie(champ: ChampContact, valeur: string): string {
  switch (champ) {
    case "nom":
      return valeur.replace(/[^\p{L}\p{M}' .-]/gu, "")
    case "telephone": {
      // Chiffres, espaces et ( ) . - ; un "+" n'est accepte qu'en tete.
      const brut = valeur.replace(/[^0-9+\s().-]/g, "")
      return brut.replace(/(?!^)\+/g, "")
    }
    case "email":
      return valeur.replace(/\s/g, "")
    case "sujet":
    case "message":
      // Detection volontaire des caracteres de controle invisibles.
      // oxlint-disable-next-line no-control-regex
      return valeur.replace(/[<>]/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    case "etablissement_id":
      return valeur
  }
}

// Valide un seul champ. Renvoie undefined si la valeur est correcte.
export function validerChampContact(champ: ChampContact, valeur: string): string | undefined {
  const v = valeur.trim()

  switch (champ) {
    case "nom": {
      if (v.length === 0) return "Le nom est obligatoire."
      if (v.length < LIMITES_CONTACT.nom.min) return `Le nom doit contenir au moins ${LIMITES_CONTACT.nom.min} caractères.`
      if (v.length > LIMITES_CONTACT.nom.max) return `Le nom ne peut pas dépasser ${LIMITES_CONTACT.nom.max} caractères.`
      if (!REGEX_NOM.test(v)) return "Utilisez uniquement des lettres, espaces, apostrophes, points ou tirets."
      return undefined
    }
    case "email": {
      if (v.length === 0) return "L'adresse e-mail est obligatoire."
      if (v.length > LIMITES_CONTACT.email.max) return "L'adresse e-mail est trop longue."
      if (!REGEX_EMAIL.test(v)) return "Exemple attendu : nom@domaine.mg"
      return undefined
    }
    case "telephone": {
      if (v.length === 0) return undefined // facultatif
      if (v.length > LIMITES_CONTACT.telephone.max) return "Le numéro est trop long."
      if (!REGEX_TELEPHONE_CARACTERES.test(v)) return "Le numéro ne doit contenir que des chiffres, espaces et +()-."
      if (normaliserTelephone(v) === null) return "Numéro invalide. Exemple : +261 34 22 330 54"
      return undefined
    }
    case "sujet":
    case "message": {
      const min = champ === "sujet" ? LIMITES_CONTACT.sujet.min : LIMITES_CONTACT.message.min
      const max = champ === "sujet" ? LIMITES_CONTACT.sujet.max : LIMITES_CONTACT.message.max
      const libelle = champ === "sujet" ? "Le sujet" : "Le message"
      if (v.length === 0) return `${libelle} est obligatoire.`
      if (v.length < min) return `${libelle} doit contenir au moins ${min} caractères.`
      if (v.length > max) return `${libelle} ne peut pas dépasser ${max} caractères.`
      if (!REGLE_SANS_BALISES.test(v)) return "Les caractères < et > ne sont pas autorisés."
      if (!REGLE_SANS_CONTROLE.test(v)) return "Caractères invisibles non autorisés."
      if (!REGLE_SANS_REPETITION.test(v)) return "Répétition abusive de caractères : reformulez votre texte."
      if (!REGLE_CONTENU_REEL.test(v)) return `${libelle} doit contenir au moins 3 lettres ou chiffres.`
      return undefined
    }
    case "etablissement_id":
      return undefined
  }
}

// Valide l'ensemble du formulaire.
export function validerContact(valeurs: ValeursContact): ErreursContact {
  const erreurs: ErreursContact = {}
  for (const champ of Object.keys(VALEURS_CONTACT_VIDES) as ChampContact[]) {
    const erreur = validerChampContact(champ, valeurs[champ])
    if (erreur) erreurs[champ] = erreur
  }
  return erreurs
}
