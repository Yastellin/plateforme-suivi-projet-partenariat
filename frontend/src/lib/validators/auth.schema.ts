// src/lib/validators/auth.schema.ts

import { z } from 'zod';

export const connexionSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est obligatoire.")
    .email('Adresse e-mail invalide.'),
  motDePasse: z
    .string()
    .min(1, 'Le mot de passe est obligatoire.')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  seSouvenir: z.boolean().optional(),
});

export type ConnexionFormValues = z.infer<typeof connexionSchema>;