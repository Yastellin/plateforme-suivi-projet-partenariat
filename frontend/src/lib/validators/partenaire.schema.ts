// src/lib/validators/partenaire.schema.ts

import { z } from 'zod';
import { creerSchemaTelephoneOptionnel } from './phone.schema';

const partenaireSchemaBase = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire.'),
  type: z.string().min(1, 'Le type est obligatoire.'),
  pays: z.string().min(1, 'Le pays est obligatoire.'),
  adresse: z.string().optional(),
  telephone: creerSchemaTelephoneOptionnel(),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  site_web: z.string().url('Adresse invalide. Exemple : https://www.exemple.mg').optional().or(z.literal('')),
  description: z.string().optional(),
  visibilite: z.enum(['PUBLIC', 'PRIVE']),
  est_strategique: z.boolean(),
  etablissement_id: z.string().optional(),
});

export function creerSchemaPartenaire(etablissementObligatoire: boolean) {
  return partenaireSchemaBase.superRefine((valeurs, ctx) => {
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

export const contactSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire.'),
  fonction: z.string().optional(),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  telephone: creerSchemaTelephoneOptionnel(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;