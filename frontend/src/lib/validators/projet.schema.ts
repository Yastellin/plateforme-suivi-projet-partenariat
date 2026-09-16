// src/lib/validators/projet.schema.ts
import { z } from "zod"

export const schemaProjet = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  intitule_officiel: z.string().optional(),
  type: z.string().min(1, "Le type est requis"),
  domaine: z.string().optional(),
  budget: z.coerce.number().nonnegative("Le budget doit etre positif").optional(),
  date_debut: z.string().min(1, "La date de debut est requise"),
  date_fin_prevue: z.string().min(1, "La date de fin prevue est requise"),
  statut: z.enum(["BROUILLON", "EN_ATTENTE", "EN_COURS", "SUSPENDU", "EXPIRE", "TERMINE"]),
  partenariat_id: z.string().optional(),
  porteur_id: z.string().optional(),
  bailleur_ids: z.array(z.string()).optional(),
  beneficiaire_ids: z.array(z.string()).optional(),
  site_ids: z.array(z.string()).optional(),
})

export type ProjetFormValues = z.infer<typeof schemaProjet>