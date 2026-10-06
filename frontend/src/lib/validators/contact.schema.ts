// src/lib/validators/contact.schema.ts

import { z } from 'zod';
import { creerSchemaTelephoneOptionnel } from './phone.schema';

export const contactSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est obligatoire.'),
  nom: z.string().min(1, 'Le nom est obligatoire.'),
  fonction: z.string().optional(),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  telephone: creerSchemaTelephoneOptionnel(),
});

export const schemaContact = contactSchema;

export type ContactFormValues = z.infer<typeof contactSchema>;