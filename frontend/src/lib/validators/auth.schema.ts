// src/lib/validators/auth.schema.ts
import { z } from "zod"

export const schemaConnexion = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  mot_de_passe: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
})

export type ConnexionFormValues = z.infer<typeof schemaConnexion>