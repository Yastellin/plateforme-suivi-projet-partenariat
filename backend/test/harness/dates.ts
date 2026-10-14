/**
 * Dates des fixtures de test, calculees par rapport au jour courant.
 *
 * Des dates figees finissent par tomber dans le passe et font echouer les
 * tests qui creent des ressources : ces helpers garantissent que les jeux de
 * donnees restent valides quelle que soit la date d'execution.
 */
import { jourCourant } from '../../src/common/validators/dates.validator';

/** Date ISO 8601 decalee de N jours par rapport au jour courant de l'API. */
export function dateIsoDans(jours: number): string {
  const date = new Date(`${jourCourant()}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + jours);
  return date.toISOString();
}

/** Champ de formulaire (AAAA-MM-JJ) decale de N jours. */
export function jourDans(jours: number): string {
  return dateIsoDans(jours).slice(0, 10);
}
