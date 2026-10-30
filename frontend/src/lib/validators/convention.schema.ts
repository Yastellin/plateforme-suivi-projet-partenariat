// src/lib/validators/convention.schema.ts

import { z } from "zod"

import { jourDe, validerDates } from "./regles-dates"

const schemaConventionBase = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  date_signature: z.string().optional(),
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
  statut: z.enum(["BROUILLON", "EN_ATTENTE_SIGNATURE", "SIGNEE", "ACTIVE", "SUSPENDUE", "EXPIREE"]),
  description: z.string().optional(),
  partenariat_id: z.string().optional(),
  projet_id: z.string().optional(),
  cotutelle_id: z.string().optional(),
})

export interface OptionsSchemaConvention {
  // A l'ajout seulement : la date de debut ne peut pas etre anterieure au jour.
  exigerDateDebutFuture?: boolean
}

export function creerSchemaConvention({ exigerDateDebutFuture = false }: OptionsSchemaConvention = {}) {
  return schemaConventionBase.superRefine((valeurs, ctx) => {
    validerDates(ctx, {
      dateDebut: valeurs.date_debut,
      exigerDateDebutFuture,
    })
    if (valeurs.date_debut && valeurs.date_fin && jourDe(valeurs.date_fin) < jourDe(valeurs.date_debut)) {
      ctx.addIssue({
        code: "custom",
        path: ["date_fin"],
        message: "La date de fin doit être postérieure ou égale à la date de début.",
      })
    }
    const estSelectionne = (valeur?: string) => Boolean(valeur && valeur !== "__aucun__")
    if (!estSelectionne(valeurs.partenariat_id) && !estSelectionne(valeurs.projet_id) && !estSelectionne(valeurs.cotutelle_id)) {
      ctx.addIssue({
        code: "custom",
        path: ["root", "liens"],
        message: "Veuillez sélectionner au moins un lien (partenariat, projet ou cotutelle).",
      })
    }
  })
}

export const schemaConvention = creerSchemaConvention()

export type ConventionFormValues = z.infer<typeof schemaConventionBase>
