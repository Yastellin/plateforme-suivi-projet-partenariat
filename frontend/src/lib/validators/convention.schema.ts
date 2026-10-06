// src/lib/validators/convention.schema.ts
import { z } from "zod"

export const schemaConvention = z.object({
  reference: z.string().min(1, "La reference est requise"),
  titre: z.string().min(2, "Le titre doit contenir au moins 2 caracteres"),
  date_signature: z.string().optional(),
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
  statut: z.enum(["BROUILLON", "EN_ATTENTE_SIGNATURE", "SIGNEE", "ACTIVE", "SUSPENDUE", "EXPIREE"]),
  description: z.string().optional(),
  partenariat_id: z.string().optional(),
  projet_id: z.string().optional(),
})

export type ConventionFormValues = z.infer<typeof schemaConvention>