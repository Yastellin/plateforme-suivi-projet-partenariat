// src/lib/validators/compte.schema.ts
import { z } from "zod"

export const schemaContact = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(255, "Le nom ne doit pas dépasser 255 caractères"),
  fonction: z.string().trim().max(255, "La fonction ne doit pas dépasser 255 caractères").optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(255, "L'email ne doit pas dépasser 255 caractères").optional().or(z.literal("")),
  telephone: z.string().trim().max(20, "Le téléphone ne doit pas dépasser 20 caractères").optional().or(z.literal("")),
})

export type ContactFormValues = z.infer<typeof schemaContact>