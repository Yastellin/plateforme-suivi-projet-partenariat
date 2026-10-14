// src/lib/validators/contact.schema.ts

import { z } from 'zod';
import { creerSchemaTelephoneOptionnel } from './phone.schema';

// Le contrat API contact accepte un seul champ nom (pas de prenom cote backend).
export const contactSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caracteres.')
    .max(100, 'Le nom complet ne peut pas depasser 100 caracteres.'),
  fonction: z.string().optional(),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  telephone: creerSchemaTelephoneOptionnel(),
});

export const schemaContact = contactSchema;

export type ContactFormValues = z.infer<typeof contactSchema>;