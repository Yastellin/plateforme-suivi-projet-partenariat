// src/lib/validators/phone.schema.ts

import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { normaliserTelephone as normaliserNumeroTelephone } from '@/lib/phone';

const MESSAGE_INVALIDE = 'Numéro invalide. Exemples acceptés : +261 32 12 345 67, 032 12 345 67, +33 6 12 34 56 78.';

export function normaliserTelephone(valeur: string): string | null {
  return normaliserNumeroTelephone(valeur);
}

export function creerSchemaTelephoneOptionnel() {
  return z
    .string()
    .optional()
    .refine((valeur) => !valeur || isValidPhoneNumber(valeur, 'MG'), { message: MESSAGE_INVALIDE });
}

export function creerSchemaTelephoneObligatoire() {
  return z
    .string()
    .min(1, 'Le numéro de téléphone est obligatoire.')
    .refine((valeur) => isValidPhoneNumber(valeur, 'MG'), { message: MESSAGE_INVALIDE });
}