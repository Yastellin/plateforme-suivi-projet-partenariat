// src/lib/validators/contact.schema.ts
import { z } from "zod"

// Reflete le CreateContactDto backend : nom requis, email valide,
// telephone a caracteres restreints.
export const schemaContact = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(255, "Le nom ne doit pas depasser 255 caracteres"),
  fonction: z.string().trim().max(255, "La fonction ne doit pas depasser 255 caracteres").optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  telephone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]*$/, "Le telephone contient des caracteres invalides")
    .max(20, "Le telephone ne doit pas depasser 20 caracteres")
    .optional()
    .or(z.literal("")),
})

export type ContactFormValues = z.infer<typeof schemaContact>

export function versPayloadContact(valeurs: ContactFormValues) {
  return {
    nom: valeurs.nom,
    fonction: valeurs.fonction || undefined,
    email: valeurs.email || undefined,
    telephone: valeurs.telephone || undefined,
  }
}
