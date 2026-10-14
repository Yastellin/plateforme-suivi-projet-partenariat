// src/features/auth/lib/libelles-erreur-token.ts

const CORRESPONDANCES: { motif: RegExp; libelle: string }[] = [
  { motif: /deja utilise/i, libelle: "Ce lien a déjà servi. Chaque lien de réinitialisation n'est utilisable qu'une fois." },
  { motif: /expire/i, libelle: "Ce lien a expiré. Demandez un nouveau lien pour poursuivre." },
  { motif: /invalide|introuvable|non trouve/i, libelle: "Ce lien n'est pas reconnu. Vérifiez qu'il a été copié en entier depuis l'e-mail." },
];

/** Traduit le message renvoyé par l'API pour un lien de réinitialisation refusé. */
export function libelleErreurToken(message: string): string {
  const correspondance = CORRESPONDANCES.find((entree) => entree.motif.test(message));
  return correspondance?.libelle ?? message;
}
