// tests/outils/dates.ts

import { jourCourant } from '../../src/lib/validators/regles-dates';

/** Jour (AAAA-MM-JJ) decale de N jours par rapport au jour courant. */
export function dateDans(jours: number): string {
  const date = new Date(`${jourCourant()}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + jours);
  return date.toISOString().slice(0, 10);
}
