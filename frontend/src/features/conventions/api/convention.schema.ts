// src/features/conventions/api/convention.schema.ts
import { z } from "zod"

// Reflete les contraintes du CreateConventionDto backend
export const schemaConvention = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(255, "Le nom ne doit pas depasser 255 caracteres"),
  description: z
    .string()
    .trim()
    .max(2000, "La description ne doit pas depasser 2000 caracteres")
    .optional()
    .or(z.literal("")),
  etablissement_id: z.string().min(1, "L'établissement est requis"),
  statut: z.enum(["BROUILLON", "EN_ATTENTE_SIGNATURE", "SIGNEE", "ACTIVE", "SUSPENDUE", "EXPIREE"]),
  visibilite: z.enum(["PUBLIC", "PRIVE"]),
  etape_circuit: z.enum(["REDACTION", "TRANSMISSION", "VERIFICATION_DAJ", "ATTENTE_SIGNATURE", "SIGNEE"]).optional(),
})

export type ConventionFormValues = z.infer<typeof schemaConvention>