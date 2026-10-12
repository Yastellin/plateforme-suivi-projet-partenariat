import { validateSync } from 'class-validator';
import {
  EstDateNonPassee,
  EstPosterieurA,
  jourCourant,
} from './dates.validator';

function jourDecale(jours: number): string {
  const date = new Date(`${jourCourant()}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + jours);
  return date.toISOString();
}

class PeriodeDto {
  @EstDateNonPassee()
  date_debut: string;

  @EstPosterieurA('date_debut', {
    message: 'La date de fin doit être postérieure à la date de début.',
  })
  date_fin?: string;
}

// Mise a jour partielle : la date de debut n'est pas fournie.
class EcheanceSeuleDto {
  date_debut?: string;

  @EstPosterieurA('date_debut', {
    message: 'La date de fin doit être postérieure à la date de début.',
  })
  date_fin?: string;
}

function erreurs(valeurs: Partial<PeriodeDto>) {
  const dto = Object.assign(new PeriodeDto(), valeurs);
  return validateSync(dto).map((erreur) => erreur.property);
}

describe('jourCourant', () => {
  it('renvoie un jour au format AAAA-MM-JJ', () => {
    expect(jourCourant()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('suit le fuseau horaire demande', () => {
    const fuseaux = ['Indian/Antananarivo', 'UTC', 'Pacific/Kiritimati'];
    for (const fuseau of fuseaux) {
      expect(jourCourant(fuseau)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    // Kiritimati (UTC+14) est toujours au moins au jour de l'UTC.
    expect(jourCourant('Pacific/Kiritimati') >= jourCourant('UTC')).toBe(true);
  });
});

describe('EstDateNonPassee', () => {
  it('refuse une date anterieure au jour courant', () => {
    expect(erreurs({ date_debut: jourDecale(-1) })).toContain('date_debut');
  });

  it('accepte le jour courant et les dates futures', () => {
    expect(erreurs({ date_debut: jourDecale(0) })).toEqual([]);
    expect(erreurs({ date_debut: jourDecale(30) })).toEqual([]);
  });

  it('compare des jours, pas des heures', () => {
    const aujourdhuiTard = `${jourCourant()}T23:59:59.000Z`;
    expect(erreurs({ date_debut: aujourdhuiTard })).toEqual([]);
  });
});

describe('EstPosterieurA', () => {
  it('accepte une date de fin posterieure', () => {
    expect(
      erreurs({ date_debut: jourDecale(0), date_fin: jourDecale(1) }),
    ).toEqual([]);
  });

  it('refuse une date de fin identique ou anterieure', () => {
    expect(
      erreurs({ date_debut: jourDecale(10), date_fin: jourDecale(10) }),
    ).toContain('date_fin');
    expect(
      erreurs({ date_debut: jourDecale(10), date_fin: jourDecale(9) }),
    ).toContain('date_fin');
  });

  it('ne compare rien quand la date de debut est absente', () => {
    expect(erreurs({ date_debut: jourDecale(10) })).toEqual([]);

    const echeanceSeule = Object.assign(new EcheanceSeuleDto(), {
      date_fin: jourDecale(-30),
    });
    expect(validateSync(echeanceSeule)).toEqual([]);
  });
});
