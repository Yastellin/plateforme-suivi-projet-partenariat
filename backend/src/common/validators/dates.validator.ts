import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

/**
 * Regles de dates communes aux modules (projets, partenariats, conventions,
 * cotutelles) :
 * - une date de debut ne peut pas etre anterieure au jour courant (creation) ;
 * - une date d'echeance doit etre posterieure a la date de debut.
 *
 * Les comparaisons se font au jour pres (jamais a l'heure) et dans le fuseau
 * de l'universite : la journee en cours est celle des utilisateurs, pas celle
 * du serveur en temps universel.
 */
const FUSEAU_HORAIRE = process.env.TZ_APPLICATION ?? 'Indian/Antananarivo';

/** Jour courant (AAAA-MM-JJ) dans le fuseau fourni. */
export function jourCourant(fuseau: string = FUSEAU_HORAIRE): string {
  const parties = new Intl.DateTimeFormat('fr-FR', {
    timeZone: fuseau,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const valeurs = Object.fromEntries(
    parties.map((partie) => [partie.type, partie.value]),
  );
  return `${valeurs.year}-${valeurs.month}-${valeurs.day}`;
}

/** Ramene une date (ISO 8601 ou AAAA-MM-JJ) a son jour, pour comparer sans l'heure. */
export function jourDe(valeur: string): string {
  return valeur.slice(0, 10);
}

@ValidatorConstraint({ name: 'estDateNonPassee', async: false })
export class EstDateNonPasseeConstraint implements ValidatorConstraintInterface {
  validate(valeur: unknown): boolean {
    if (typeof valeur !== 'string' || valeur.trim() === '') return false;
    return jourDe(valeur) >= jourCourant();
  }

  defaultMessage(): string {
    return "La date de début doit être aujourd'hui ou postérieure.";
  }
}

/** Interdit une date anterieure au jour courant (regle d'ajout). */
export function EstDateNonPassee(
  options?: ValidationOptions,
): PropertyDecorator {
  return (objet: object, propriete: string | symbol) => {
    registerDecorator({
      name: 'estDateNonPassee',
      target: objet.constructor,
      propertyName: propriete.toString(),
      options,
      validator: EstDateNonPasseeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'estPosterieurA', async: false })
export class EstPosterieurAConstraint implements ValidatorConstraintInterface {
  validate(valeur: unknown, arguments_: ValidationArguments): boolean {
    if (typeof valeur !== 'string' || valeur.trim() === '') return true;

    const [champReference, egaliteAutorisee = false] =
      arguments_.constraints as [string, boolean?];
    const reference = (arguments_.object as Record<string, unknown>)[
      champReference
    ];
    if (typeof reference !== 'string' || reference.trim() === '') return true;

    return egaliteAutorisee
      ? jourDe(valeur) >= jourDe(reference)
      : jourDe(valeur) > jourDe(reference);
  }

  defaultMessage(arguments_: ValidationArguments): string {
    const [champReference, egaliteAutorisee = false] =
      arguments_.constraints as [string, boolean?];
    return egaliteAutorisee
      ? `La date saisie doit être postérieure ou égale au champ ${champReference}.`
      : `La date saisie doit être postérieure au champ ${champReference}.`;
  }
}

/**
 * Exige que la date soit strictement posterieure a une autre date du meme
 * objet. La regle ne s'applique que si les deux dates sont fournies, ce qui
 * laisse les mises a jour partielles libres de ne renseigner qu'un champ.
 */
export function EstPosterieurA(
  champReference: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return (objet: object, propriete: string | symbol) => {
    registerDecorator({
      name: 'estPosterieurA',
      target: objet.constructor,
      propertyName: propriete.toString(),
      constraints: [champReference],
      options,
      validator: EstPosterieurAConstraint,
    });
  };
}

/** Autorise une date égale à la date de référence. */
export function EstPosterieurOuEgalA(
  champReference: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return (objet: object, propriete: string | symbol) => {
    registerDecorator({
      name: 'estPosterieurOuEgalA',
      target: objet.constructor,
      propertyName: propriete.toString(),
      constraints: [champReference, true],
      options,
      validator: EstPosterieurAConstraint,
    });
  };
}
