// src/lib/validators/mot-de-passe.schema.ts

import { z } from "zod"

export const LONGUEUR_MIN_MOT_DE_PASSE = 8
export const LONGUEUR_MAX_MOT_DE_PASSE = 72
export const MOTIF_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

export const AIDE_MOT_DE_PASSE = `Entre ${LONGUEUR_MIN_MOT_DE_PASSE} et ${LONGUEUR_MAX_MOT_DE_PASSE} caractères, avec au moins une majuscule, une minuscule et un chiffre.`

export const REGLES_MOT_DE_PASSE = [
  { cle: "longueur", libelle: `${LONGUEUR_MIN_MOT_DE_PASSE} caractères minimum`, verifie: (valeur: string) => valeur.length >= LONGUEUR_MIN_MOT_DE_PASSE },
  { cle: "majuscule", libelle: "Une majuscule", verifie: (valeur: string) => /[A-Z]/.test(valeur) },
  { cle: "minuscule", libelle: "Une minuscule", verifie: (valeur: string) => /[a-z]/.test(valeur) },
  { cle: "chiffre", libelle: "Un chiffre", verifie: (valeur: string) => /\d/.test(valeur) },
] as const

const motDePasseSaisi = z
  .string()
  .min(1, "Le mot de passe est obligatoire.")
  .min(LONGUEUR_MIN_MOT_DE_PASSE, `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`)
  .max(LONGUEUR_MAX_MOT_DE_PASSE, `Le mot de passe ne peut pas dépasser ${LONGUEUR_MAX_MOT_DE_PASSE} caractères.`)
  .regex(MOTIF_MOT_DE_PASSE, "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.")

export const motDePasseOublieSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est obligatoire.")
    .email("Adresse e-mail invalide."),
})

export type MotDePasseOublieFormValues = z.infer<typeof motDePasseOublieSchema>

export const reinitialiserMotDePasseSchema = z
  .object({
    nouveauMotDePasse: motDePasseSaisi,
    confirmationMotDePasse: z.string().min(1, "Veuillez confirmer le mot de passe."),
  })
  .refine((valeurs) => valeurs.nouveauMotDePasse === valeurs.confirmationMotDePasse, {
    path: ["confirmationMotDePasse"],
    message: "Les deux mots de passe ne correspondent pas.",
  })

export type ReinitialiserMotDePasseFormValues = z.infer<typeof reinitialiserMotDePasseSchema>
