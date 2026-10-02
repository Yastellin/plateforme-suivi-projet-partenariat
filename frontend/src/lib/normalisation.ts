// src/lib/normalisation.ts

export function normaliserNomPersonne(valeur: string): string {
  return valeur.trim().toUpperCase();
}

export function normaliserPrenom(valeur: string): string {
  return valeur
    .trim()
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-zà-ÿ])/g, (_correspondance, separateur: string, lettre: string) => separateur + lettre.toUpperCase());
}

export function normaliserEmail(valeur: string): string {
  return valeur.trim().toLowerCase();
}