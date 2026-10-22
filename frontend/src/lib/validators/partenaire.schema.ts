// src/lib/validators/partenaire.schema.ts

import { z } from 'zod';
import { creerSchemaTelephoneListe, creerSchemaTelephoneOptionnel } from './phone.schema';
import { verifierCoordonneesRepetees } from './coordonnees.schema';

const partenaireSchemaBase = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire.'),
  type: z.string().min(1, 'Le type est obligatoire.'),
  pays: z.string().min(1, 'Le pays est obligatoire.'),
  adresse: z.string().optional(),
  telephone: creerSchemaTelephoneOptionnel(),
  telephones: z.array(creerSchemaTelephoneListe()).optional(),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  emails: z.array(z.string().email('Adresse e-mail invalide.').or(z.literal(''))).optional(),
  site_web: z.string().url('Adresse invalide. Exemple : https://www.exemple.mg').optional().or(z.literal('')),
  description: z.string().optional(),
  visibilite: z.enum(['PUBLIC', 'PRIVE']),
  est_strategique: z.boolean(),
  etablissement_id: z.string().optional(),
});

export function creerSchemaPartenaire(etablissementObligatoire: boolean) {
  return partenaireSchemaBase.superRefine((valeurs, ctx) => {
    verifierCoordonneesRepetees(valeurs, ctx);
    if (etablissementObligatoire && !valeurs.etablissement_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['etablissement_id'],
        message: "L'établissement porteur est obligatoire.",
      });
    }
  });
}

export type PartenaireFormValues = z.infer<typeof partenaireSchemaBase>;