// src/lib/validators/cotutelle.schema.ts
import { z } from "zod"

export const schemaCotutelle = z.object({
  nom_doctorant: z.string().min(2, "Le nom du doctorant est requis"),
  specialite: z.string().optional(),
  directeur_these_local: z.string().optional(),
  directeur_these_partenaire: z.string().optional(),
  type: z.enum(["COTUTELLE", "COENCADREMENT"]),
  date_debut: z.string().min(1, "La date de debut est requise"),
  date_prevue_soutenance: z.string().optional(),
  financement_bourse: z.string().optional(),
  etablissement_id: z.string().min(1, "L'etablissement est requis"),
  partenaire_id: z.string().min(1, "Le partenaire (universite) est requis"),
})

export type CotutelleFormValues = z.infer<typeof schemaCotutelle>