// src/lib/validators/partenaire.schema.ts
import { z } from "zod"

// Reflete les contraintes du CreatePartenaireDto backend
// (nom: 2-255, email valide, url http(s) pour le site web).
export const schemaPartenaire = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(255, "Le nom ne doit pas depasser 255 caracteres"),
  type: z.string().trim().min(1, "Le type est requis").max(100, "Le type ne doit pas depasser 100 caracteres"),
  pays: z
    .string()
    .trim()
    .min(2, "Le pays est requis")
    .max(100, "Le pays ne doit pas depasser 100 caracteres"),
  adresse: z.string().trim().max(255).optional().or(z.literal("")),
  telephone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]*$/, "Le telephone contient des caracteres invalides")
    .max(20, "Le telephone ne doit pas depasser 20 caracteres")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  site_web: z
    .string()
    .trim()
    .url("L'adresse du site web est invalide")
    .max(255)
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(2000, "La description ne doit pas depasser 2000 caracteres").optional().or(z.literal("")),
  statut: z.enum(["ACTIF", "SUSPENDU"]),
  visibilite: z.enum(["PUBLIC", "PRIVE"]),
  est_strategique: z.boolean(),
})

export type PartenaireFormValues = z.infer<typeof schemaPartenaire>

// Charges utiles envoyees au backend : les chaines vides deviennent
// undefined afin que les champs optionnels ne soient pas transmis.
export function versPayloadPartenaire(valeurs: PartenaireFormValues) {
  return {
    nom: valeurs.nom,
    type: valeurs.type,
    pays: valeurs.pays,
    adresse: valeurs.adresse || undefined,
    telephone: valeurs.telephone || undefined,
    email: valeurs.email || undefined,
    site_web: valeurs.site_web || undefined,
    description: valeurs.description || undefined,
    statut: valeurs.statut,
    visibilite: valeurs.visibilite,
    est_strategique: valeurs.est_strategique,
  }
}
