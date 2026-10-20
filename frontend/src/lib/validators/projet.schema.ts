// src/lib/validators/projet.schema.ts
import { z } from "zod"

import { validerDates } from "./regles-dates"

const schemaProjetBase = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  intitule_officiel: z.string().optional(),
  type: z.string().min(1, "Le type est requis"),
  domaine: z.string().optional(),
  budget: z.coerce.number().nonnegative("Le budget doit etre positif").optional(),
  date_debut: z.string().min(1, "La date de debut est requise"),
  date_fin_prevue: z.string().min(1, "La date de fin prevue est requise"),
  statut: z.enum(["BROUILLON", "EN_ATTENTE", "EN_COURS", "SUSPENDU", "EXPIRE", "TERMINE"]),
  partenariat_id: z.string().optional(),
  etablissement_id: z.string().optional(),
  porteur_id: z.string().optional(),
  bailleurs_ids: z.array(z.string()).optional(),
  beneficiaires_ids: z.array(z.string()).optional(),
  sites_ids: z.array(z.string()).optional(),
})

export interface OptionsSchemaProjet {
  // A la creation seule : la date de debut ne peut pas etre anterieure au jour.
  exigerDateDebutFuture?: boolean
  // La presidence doit choisir l'etablissement porteur (le compte n'en depend pas).
  etablissementObligatoire?: boolean
}

export function creerSchemaProjet({
  exigerDateDebutFuture = false,
  etablissementObligatoire = false,
}: OptionsSchemaProjet = {}) {
  return schemaProjetBase.superRefine((valeurs, ctx) => {
    if (etablissementObligatoire && !valeurs.etablissement_id) {
      ctx.addIssue({
        code: "custom",
        path: ["etablissement_id"],
        message: "L'etablissement porteur est obligatoire.",
      })
    }

    validerDates(ctx, {
      dateDebut: valeurs.date_debut,
      dateFin: valeurs.date_fin_prevue,
      champFin: "date_fin_prevue",
      libelleFin: "date de fin prévue",
      exigerDateDebutFuture,
    })
  })
}

export const schemaProjet = creerSchemaProjet()

export type ProjetFormValues = z.infer<typeof schemaProjetBase>