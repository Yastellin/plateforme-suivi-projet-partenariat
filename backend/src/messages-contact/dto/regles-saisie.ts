// Regles de contenu des champs libres du formulaire de contact public.
// Les memes expressions sont reprises cote interface (lib/validators/message-contact.ts).

// Aucune balise HTML ou caractere de script.
export const REGLE_SANS_BALISES = /^[^<>]*$/;

// Pas de suite de 10 caracteres identiques (ex. "aaaaaaaaaa", "!!!!!!!!!!").
export const REGLE_SANS_REPETITION = /^(?![\s\S]*([\s\S])\1{9,})[\s\S]*$/;

// Au moins 3 lettres ou chiffres : interdit les messages uniquement symboliques.
export const REGLE_CONTENU_REEL =
  /^(?:[^\p{L}\p{N}]*[\p{L}\p{N}]){3,}[\s\S]*$/u;

// Caracteres de controle (hors retour a la ligne et tabulation).
/* eslint-disable no-control-regex -- ces plages sont précisément les caractères refusés */
export const REGLE_SANS_CONTROLE =
  /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/;
/* eslint-enable no-control-regex */
