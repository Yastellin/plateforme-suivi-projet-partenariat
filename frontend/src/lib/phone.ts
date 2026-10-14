// src/lib/phone.ts

import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';

export function normaliserTelephone(valeur: string, paysDefaut: CountryCode = 'MG'): string | null {
  if (!valeur || valeur.trim() === '') {
    return null;
  }
  try {
    if (!isValidPhoneNumber(valeur, paysDefaut)) {
      return null;
    }
    const analyse = parsePhoneNumber(valeur, paysDefaut);
    return analyse.format('E.164');
  } catch {
    return null;
  }
}

export function formaterTelephone(e164: string): string {
  try {
    const analyse = parsePhoneNumber(e164);
    return analyse.formatInternational();
  } catch {
    return e164;
  }
}