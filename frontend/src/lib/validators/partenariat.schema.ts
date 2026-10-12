// src/lib/validators/partenariat.schema.ts

import { z } from 'zod';

import { validerDates } from './regles-dates';

export const DOMAINES_PARTENARIAT = [
  'RECHERCHE',
  'FORMATION',
  'INNOVATION',
  'DEVELOPPEMENT',
  'COOPERATION_INSTITUTIONNELLE',
  'AUTRE',
] as const;

const partenariatSchemaBase = z.object({
  intitule: z.string().min(1, "L'intitulé est obligatoire."),
  objet: z.string().optional(),
  domaine: z.enum(DOMAINES_PARTENARIAT, { message: 'Sélectionnez un domaine.' }),
  date_debut: z.string().min(1, 'La date de début est obligatoire.'),
  date_fin: z.string().optional(),
  partenaires_ids: z.array(z.string()).min(1, 'Sélectionnez au moins un partenaire.'),
  etablissements_ids: z.array(z.string()),
  actions_realisees: z.string().optional(),
  actions_en_cours: z.string().optional(),
  actions_prevues: z.string().optional(),
  resultats_obtenus: z.string().optional(),
  difficultes_contraintes: z.string().optional(),
  perspectives_recommandations: z.string().optional(),
});

export interface OptionsSchemaPartenariat {
  // A la creation seule : la date de debut ne peut pas etre anterieure au jour.
  exigerDateDebutFuture?: boolean
}

export function creerSchemaPartenariat(
  etablissementsObligatoires: boolean,
  { exigerDateDebutFuture = false }: OptionsSchemaPartenariat = {},
) {
  return partenariatSchemaBase.superRefine((valeurs, ctx) => {
    if (etablissementsObligatoires && valeurs.etablissements_ids.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['etablissements_ids'],
        message: 'Sélectionnez au moins un établissement.',
      });
    }

    validerDates(ctx, {
      dateDebut: valeurs.date_debut,
      dateFin: valeurs.date_fin,
      exigerDateDebutFuture,
    });
  });
}

export type PartenariatFormValues = z.infer<typeof partenariatSchemaBase>;