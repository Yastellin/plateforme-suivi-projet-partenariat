import type { SelectQueryBuilder } from 'typeorm';
import {
  ajouterFiltreStatutsExport,
  CORRESPONDANCES_STATUTS_EXPORT,
  estEnRetardExport,
  REGLES_RETARD_EXPORT,
} from './statuts-export';
import { STATUTS_FILTRE_EXPORT, StatutFiltreExport } from './export.enums';

function creerRequete() {
  const andWhere = jest.fn().mockReturnThis();
  return {
    requete: { andWhere } as unknown as SelectQueryBuilder<object>,
    andWhere,
  };
}

const maintenant = new Date('2026-06-15T12:00:00.000Z');
const hier = new Date('2026-06-14T12:00:00.000Z');
const plusTardAujourdhui = new Date('2026-06-15T23:59:59.000Z');
const debutAujourdhui = new Date('2026-06-15T00:00:00.000Z');

describe('statuts d’export', () => {
  it('conserve les correspondances réelles par entité', () => {
    expect(CORRESPONDANCES_STATUTS_EXPORT.CONVENTIONS).toEqual({
      EN_COURS: ['SIGNEE', 'ACTIVE'],
      SUSPENDU: ['SUSPENDUE'],
      EXPIRE: ['EXPIREE'],
    });
    expect(CORRESPONDANCES_STATUTS_EXPORT.PROJETS).toEqual({
      EN_COURS: ['EN_COURS'],
      TERMINE: ['TERMINE'],
      SUSPENDU: ['SUSPENDU'],
      EXPIRE: ['EXPIRE'],
    });
    expect(CORRESPONDANCES_STATUTS_EXPORT.PARTENARIATS).toEqual({
      EN_COURS: ['EN_COURS'],
      TERMINE: ['TERMINE'],
      SUSPENDU: ['SUSPENDU'],
    });
  });

  it('conserve dans le module les règles de retard réelles', () => {
    expect(REGLES_RETARD_EXPORT).toEqual({
      CONVENTIONS: {
        statutToujoursEnRetard: 'EXPIREE',
        statutsExclus: [],
        sansRegle: false,
      },
      PROJETS: {
        statutsExclus: ['BROUILLON', 'TERMINE', 'EXPIRE'],
        sansRegle: false,
      },
      PARTENARIATS: { statutsExclus: [], sansRegle: true },
    });
  });

  it('n’applique aucun filtre de statut si les cinq options sont cochées', () => {
    const { requete, andWhere } = creerRequete();
    ajouterFiltreStatutsExport(
      requete,
      'PROJETS',
      'projet.statut',
      'projet.date_fin_prevue',
      STATUTS_FILTRE_EXPORT,
      maintenant,
    );
    expect(andWhere).not.toHaveBeenCalled();
  });

  it('renvoie zéro ligne pour une sélection vide', () => {
    const { requete, andWhere } = creerRequete();
    ajouterFiltreStatutsExport(
      requete,
      'CONVENTIONS',
      'convention.statut',
      'convention.date_fin',
      [],
      maintenant,
    );
    expect(andWhere).toHaveBeenCalledWith('1 = 0');
  });

  it('copie le seuil temporel et les exclusions du calcul des projets', () => {
    const { requete, andWhere } = creerRequete();
    ajouterFiltreStatutsExport(
      requete,
      'PROJETS',
      'projet.statut',
      'projet.date_fin_prevue',
      [StatutFiltreExport.EN_RETARD],
      maintenant,
    );

    expect(andWhere).toHaveBeenCalledWith(
      expect.stringContaining('projet.date_fin_prevue < :dateRetard'),
      expect.objectContaining({
        dateRetard: maintenant,
        statutsExclusRetard: ['BROUILLON', 'TERMINE', 'EXPIRE'],
      }),
    );
  });

  it('inclut une convention expirée ou dont la date de fin est dépassée, sans exclusion de statut', () => {
    const { requete, andWhere } = creerRequete();
    ajouterFiltreStatutsExport(
      requete,
      'CONVENTIONS',
      'convention.statut',
      'convention.date_fin',
      [StatutFiltreExport.EN_RETARD],
      maintenant,
    );

    expect(andWhere).toHaveBeenCalledWith(
      expect.stringContaining('convention.statut = :statutToujoursEnRetard'),
      expect.objectContaining({
        statutToujoursEnRetard: 'EXPIREE',
        dateRetard: maintenant,
      }),
    );
    expect(andWhere.mock.calls[0][0]).toContain(' OR ');
    expect(andWhere.mock.calls[0][0]).not.toContain('NOT IN');
  });

  it('ne dérive aucun retard pour les partenariats, qui n’ont pas de règle existante', () => {
    const { requete, andWhere } = creerRequete();
    ajouterFiltreStatutsExport(
      requete,
      'PARTENARIATS',
      'partenariat.statut',
      'partenariat.date_fin',
      [StatutFiltreExport.EN_RETARD],
      maintenant,
    );
    expect(andWhere).toHaveBeenCalledWith('1 = 0');
    expect(
      estEnRetardExport('PARTENARIATS', 'EN_COURS', hier, maintenant),
    ).toBe(false);
  });

  it('réunit En retard et Suspendu dans une seule clause SQL', () => {
    const { requete, andWhere } = creerRequete();
    ajouterFiltreStatutsExport(
      requete,
      'PROJETS',
      'projet.statut',
      'projet.date_fin_prevue',
      [StatutFiltreExport.EN_RETARD, StatutFiltreExport.SUSPENDU],
      maintenant,
    );

    expect(andWhere).toHaveBeenCalledTimes(1);
    expect(andWhere.mock.calls[0][0]).toContain(' OR ');
    expect(andWhere.mock.calls[0][1].statutsDirects).toEqual(['SUSPENDU']);
  });

  it.each([
    ['CONVENTIONS', 'ACTIVE', hier, true],
    ['CONVENTIONS', 'SUSPENDUE', hier, true],
    ['CONVENTIONS', 'BROUILLON', hier, true],
    ['CONVENTIONS', 'EXPIREE', plusTardAujourdhui, true],
    ['CONVENTIONS', 'ACTIVE', plusTardAujourdhui, false],
    ['PROJETS', 'EN_COURS', hier, true],
    ['PROJETS', 'SUSPENDU', hier, true],
    ['PROJETS', 'TERMINE', hier, false],
    ['PROJETS', 'BROUILLON', hier, false],
    ['PROJETS', 'EXPIRE', hier, false],
    ['PROJETS', 'EN_COURS', plusTardAujourdhui, false],
    ['PARTENARIATS', 'EN_COURS', hier, false],
    ['PARTENARIATS', 'TERMINE', hier, false],
    ['PARTENARIATS', 'SUSPENDU', hier, false],
    ['PARTENARIATS', 'BROUILLON', hier, false],
  ] as const)(
    'évalue %s/%s à la date %s selon sa règle existante',
    (entite, statut, dateFin, attendu) => {
      expect(estEnRetardExport(entite, statut, dateFin, maintenant)).toBe(
        attendu,
      );
    },
  );

  it('compare les horodatages exacts : une échéance du jour avant maintenant est dépassée', () => {
    expect(
      estEnRetardExport('PROJETS', 'EN_COURS', debutAujourdhui, maintenant),
    ).toBe(true);
    expect(
      estEnRetardExport('PROJETS', 'EN_COURS', maintenant, maintenant),
    ).toBe(false);
  });
});
