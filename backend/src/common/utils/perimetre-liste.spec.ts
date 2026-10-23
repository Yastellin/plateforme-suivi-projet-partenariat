import { Role } from '../enums/role.enum';
import { determinerPerimetreListe } from './perimetre-liste';

describe('determinerPerimetreListe', () => {
  it('limite la liste générale de la Présidence à ses propres données', () => {
    expect(determinerPerimetreListe({ role: Role.PRESIDENCE })).toEqual({
      origine: Role.PRESIDENCE,
    });
  });

  it("réserve la section d'un établissement à ses données soumises", () => {
    expect(
      determinerPerimetreListe(
        { role: Role.PRESIDENCE },
        'etablissement-fianarantsoa',
      ),
    ).toEqual({
      etablissementId: 'etablissement-fianarantsoa',
      origine: Role.ETABLISSEMENT,
      soumisesUniquement: true,
    });
  });

  it('impose à un établissement le périmètre de son compte', () => {
    expect(
      determinerPerimetreListe({
        role: Role.ETABLISSEMENT,
        etablissement_id: 'faculte-sciences-toliara',
      }),
    ).toEqual({ etablissementId: 'faculte-sciences-toliara' });
  });

  it('laisse le décideur utiliser les filtres demandés', () => {
    expect(determinerPerimetreListe({ role: Role.DECIDEUR })).toEqual({});
  });
});
