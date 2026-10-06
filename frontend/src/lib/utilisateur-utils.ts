// src/lib/utilisateur-utils.ts

/**
 * Dérive un nom d'affichage court à partir de l'e-mail de l'utilisateur.
 * Ex. `rakoto.andrianina@exemple.mg` → « Rakoto A. »
 */
export function nomAffichageUtilisateur(email: string): string {
  const partieLocale = email.split('@')[0] ?? '';
  const segments = partieLocale.split(/[._-]/).filter(Boolean);
  if (segments.length === 0) return email;
  if (segments.length === 1) return segments[0];
  const prenom = segments[0];
  const initialeNom = segments[1][0].toUpperCase();
  return `${prenom.charAt(0).toUpperCase()}${prenom.slice(1)} ${initialeNom}.`;
}

/**
 * Initiales à afficher dans l'avatar. Ex. `rakoto.andrianina@…` → « RA »
 */
export function initialesUtilisateur(email: string): string {
  const partieLocale = email.split('@')[0] ?? '';
  const segments = partieLocale.split(/[._-]/).filter(Boolean);
  if (segments.length === 0) return email.slice(0, 2).toUpperCase();
  if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
  return (segments[0][0] + segments[1][0]).toUpperCase();
}
