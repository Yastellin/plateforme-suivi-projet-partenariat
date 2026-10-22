// src/lib/validators/contact.schema.ts

import { z } from 'zod';
import { creerSchemaTelephoneListe, creerSchemaTelephoneOptionnel } from './phone.schema';
import { verifierCoordonneesRepetees } from './coordonnees.schema';

// Le contrat API contact accepte un seul champ nom (pas de prenom cote backend).
export const contactSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères.')
    .max(100, 'Le nom complet ne peut pas dépasser 100 caractères.')
    .regex(/^[\p{L}\p{M}\s'-]+$/u, "Utilisez uniquement des lettres, espaces, apostrophes et traits d'union."),
  fonction: z.string().optional(),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  emails: z.array(z.string().email('Adresse e-mail invalide.').or(z.literal(''))).optional(),
  telephone: creerSchemaTelephoneOptionnel(),
  telephones: z.array(creerSchemaTelephoneListe()).optional(),
}).superRefine(verifierCoordonneesRepetees);

export const schemaContact = contactSchema;

export type ContactFormValues = z.infer<typeof contactSchema>;