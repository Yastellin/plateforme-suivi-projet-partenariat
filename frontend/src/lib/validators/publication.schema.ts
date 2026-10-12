// src/lib/validators/publication.schema.ts
import { z } from "zod"

export const schemaPublication = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caracteres"),
  description_publique: z.string().optional(),
  date_publication: z.string().optional(),
  resultats: z.string().optional(),
})

export type PublicationFormValues = z.infer<typeof schemaPublication>