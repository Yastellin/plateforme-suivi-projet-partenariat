// src/lib/validators/message-contact.ts
//
// Regles de saisie du formulaire de contact public. Elles reprennent
// exactement celles de CreateMessageContactDto (backend) : le serveur reste
// la reference, ces controles evitent un aller-retour inutile a l'utilisateur.

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

const REGEX_NOM = /^[\p{L}\p{M}' .-]+$/u
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REGEX_TELEPHONE_CARACTERES = /^\+?[0-9\s().-]*$/

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
    case "sujet": {
      if (v.length === 0) return "Le sujet est obligatoire."
      if (v.length < LIMITES_CONTACT.sujet.min) return `Le sujet doit contenir au moins ${LIMITES_CONTACT.sujet.min} caractères.`
      if (v.length > LIMITES_CONTACT.sujet.max) return `Le sujet ne peut pas dépasser ${LIMITES_CONTACT.sujet.max} caractères.`
      return undefined
    }
    case "message": {
      if (v.length === 0) return "Le message est obligatoire."
      if (v.length < LIMITES_CONTACT.message.min) return `Le message doit contenir au moins ${LIMITES_CONTACT.message.min} caractères.`
      if (v.length > LIMITES_CONTACT.message.max) return `Le message ne peut pas dépasser ${LIMITES_CONTACT.message.max} caractères.`
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
