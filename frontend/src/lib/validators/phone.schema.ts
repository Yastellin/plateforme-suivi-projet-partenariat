// src/lib/validators/phone.schema.ts

import { z } from 'zod';

const TELEPHONE_MG_INTERNATIONAL = /^\+2613[2348]\d{7}$/;
const TELEPHONE_MG_LOCAL = /^03[2348]\d{7}$/;

export function normaliserTelephone(valeur: string): string {
  return valeur.replace(/\s+/g, '');
}

export function creerSchemaTelephoneOptionnel() {
  return z
    .string()
    .optional()
    .refine(
      (valeur) => !valeur || TELEPHONE_MG_INTERNATIONAL.test(normaliserTelephone(valeur)) || TELEPHONE_MG_LOCAL.test(normaliserTelephone(valeur)),
      { message: 'Numéro invalide. Format attendu : +261 32 12 345 67 ou 032 12 345 67.' },
    );
}