// src/lib/validators/convention.schema.ts

import { z } from "zod"

import { validerDates } from "./regles-dates"

const schemaConventionBase = z.object({
  reference: z.string().min(1, "La référence est requise"),
  titre: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
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
      dateFin: valeurs.date_fin,
      exigerDateDebutFuture,
    })
  })
}

export const schemaConvention = creerSchemaConvention()

export type ConventionFormValues = z.infer<typeof schemaConventionBase>
