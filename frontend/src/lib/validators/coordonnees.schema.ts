import { z } from 'zod';
import { normaliserTelephone } from './phone.schema';

interface ValeursCoordonneesFormulaire {
  email?: string | null;
  emails?: string[] | null;
  telephone?: string | null;
  telephones?: string[] | null;
}

interface CoordonneeAvecChemin {
  valeur: string;
  chemin: (string | number)[];
}

const MESSAGE_EMAIL_REPETE = 'Cette adresse e-mail est déjà saisie dans ce formulaire.';
const MESSAGE_TELEPHONE_REPETE = 'Ce numéro de téléphone est déjà saisi dans ce formulaire.';

/**
 * Reproduit côté formulaire l'unicité imposée par le registre de coordonnées
 * du backend. Les variantes de casse des e-mails et les formes locale / E.164
 * d'un numéro malgache sont donc considérées comme une seule valeur.
 */
export function verifierCoordonneesRepetees(
  valeurs: ValeursCoordonneesFormulaire,
  ctx: z.RefinementCtx,
): void {
  verifierRepetitions(
    construireListe(valeurs.email, valeurs.emails, 'email', 'emails'),
    (valeur) => valeur.trim().toLocaleLowerCase('fr'),
    MESSAGE_EMAIL_REPETE,
    ctx,
  );
  verifierRepetitions(
    construireListe(
      valeurs.telephone,
      valeurs.telephones,
      'telephone',
      'telephones',
    ),
    (valeur) => normaliserTelephone(valeur) ?? valeur.trim().replace(/^00/, '+').replace(/(?!^)\D/g, ''),
    MESSAGE_TELEPHONE_REPETE,
    ctx,
  );
}

function construireListe(
  principale: string | null | undefined,
  supplementaires: string[] | null | undefined,
  champPrincipal: string,
  champSupplementaire: string,
): CoordonneeAvecChemin[] {
  return [
    ...(principale ? [{ valeur: principale, chemin: [champPrincipal] }] : []),
    ...(supplementaires ?? []).map((valeur, index) => ({
      valeur,
      chemin: [champSupplementaire, index],
    })),
  ];
}

function verifierRepetitions(
  coordonnees: CoordonneeAvecChemin[],
  normaliser: (valeur: string) => string,
  message: string,
  ctx: z.RefinementCtx,
): void {
  const dejaVues = new Set<string>();
  for (const coordonnee of coordonnees) {
    const normalisee = normaliser(coordonnee.valeur);
    if (!normalisee) continue;
    if (dejaVues.has(normalisee)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: coordonnee.chemin,
        message,
      });
    } else {
      dejaVues.add(normalisee);
    }
  }
}
