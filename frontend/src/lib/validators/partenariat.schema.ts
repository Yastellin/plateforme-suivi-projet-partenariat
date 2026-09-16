// src/lib/validators/partenariat.schema.ts
import { z } from "zod"

export const schemaPartenariat = z.object({
  intitule: z.string().min(2, "L'intitule doit contenir au moins 2 caracteres"),
  objet: z.string().optional(),
  domaine: z.enum(["RECHERCHE", "FORMATION", "INNOVATION", "DEVELOPPEMENT", "COOPERATION_INSTITUTIONNELLE", "AUTRE"]),
  date_debut: z.string().min(1, "La date de debut est requise"),
  date_fin: z.string().optional(),
  statut: z.enum(["BROUILLON", "EN_ATTENTE", "EN_COURS", "SUSPENDU", "TERMINE"]),
  etablissement_ids: z.array(z.string()).min(1, "Selectionnez au moins un etablissement"),
  partenaire_ids: z.array(z.string()).min(1, "Selectionnez au moins un partenaire"),
  actions_realisees: z.string().optional(),
  actions_en_cours: z.string().optional(),
  actions_prevues: z.string().optional(),
  resultats_obtenus: z.string().optional(),
  difficultes_contraintes: z.string().optional(),
  perspectives_recommandations: z.string().optional(),
})

export type PartenariatFormValues = z.infer<typeof schemaPartenariat>