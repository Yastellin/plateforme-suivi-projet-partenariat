// src/lib/payload.ts

/*
 * Les formulaires HTML renvoient des chaines vides pour les champs non
 * renseignes (dates, listes deroulantes, zones de texte). L'API, elle, attend
 * `null` (ou l'absence de la cle) : une date vide envoye telle quelle est
 * rejetee par la validation ("must be a valid ISO 8601 date string").
 */

function estObjetSimple(valeur: unknown): valeur is Record<string, unknown> {
  return (
    typeof valeur === 'object' &&
    valeur !== null &&
    !Array.isArray(valeur) &&
    Object.getPrototypeOf(valeur) === Object.prototype
  );
}

export function normaliserPayload(valeur: unknown): unknown {
  if (typeof valeur === 'string') {
    return valeur.trim() === '' ? null : valeur;
  }

  if (Array.isArray(valeur)) {
    return valeur.map(normaliserPayload);
  }

  if (estObjetSimple(valeur)) {
    return Object.fromEntries(
      Object.entries(valeur).map(([cle, v]) => [cle, normaliserPayload(v)]),
    );
  }

  return valeur;
}

export function videsEnNull<T extends object>(objet: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(objet).map(([cle, valeur]) => [cle, valeur === '' ? null : valeur]),
  );
}

export function estPayloadNormalisable(valeur: unknown): boolean {
  return estObjetSimple(valeur) || Array.isArray(valeur);
}
