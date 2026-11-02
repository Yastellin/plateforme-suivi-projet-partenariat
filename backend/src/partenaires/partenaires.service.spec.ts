import { ConflictException } from '@nestjs/common';
import { Partenaire } from './entities/partenaire.entity';
import { PartenairesService } from './partenaires.service';
import { Role } from '../common/enums/role.enum';

function creerService(
  dependances: {
    partenaires?: Partial<Partenaire>[];
    coordonnees?: Record<string, jest.Mock>;
    transaction?: jest.Mock;
  } = {},
) {
  const partenaireRepo = {
    find: jest.fn().mockResolvedValue(dependances.partenaires ?? []),
  };
  const coordonnees = {
    valeursPartenaire: jest
      .fn()
      .mockResolvedValue({ emails: [], telephones: [] }),
    synchroniserPartenaire: jest.fn().mockResolvedValue(undefined),
    ...dependances.coordonnees,
  };
  const manager = {
    getRepository: jest.fn(() => ({
      update: jest.fn().mockResolvedValue(undefined),
    })),
  };
  const dataSource = {
    transaction:
      dependances.transaction ?? jest.fn((operation) => operation(manager)),
  };
  const historique = { enregistrer: jest.fn().mockResolvedValue(undefined) };
  const service = new PartenairesService(
    partenaireRepo as any,
    {} as any,
    historique as any,
    {} as any,
    dataSource as any,
    coordonnees as any,
  );
  return { service, partenaireRepo, coordonnees, dataSource, historique };
}

describe('PartenairesService — doublons de nom', () => {
  it('refuse la création d’un nom identique après normalisation', async () => {
    const { service } = creerService({
      partenaires: [
        {
          id: 'partenaire-existant',
          nom: 'Université d’Antananarivo',
          archive: false,
        },
      ],
    });

    await expect(
      service.create('etablissement-2', {
        nom: '  UNIVERSITE   d’Antananarivo ',
        pays: 'Madagascar',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('conserve le format complet du endpoint de recherche existant', async () => {
    const { service } = creerService({
      partenaires: [
        {
          id: 'partenaire-1',
          nom: 'Université de Toliara',
          pays: 'Madagascar',
          type: 'Université',
          adresse: 'Maninday',
          etablissement_id: 'etab-1',
          archive: false,
        } as Partenaire,
      ],
    });

    const resultat = await service.rechercherDoublon(
      { nom: 'Universite de Toliara', pays: 'Madagascar' },
      'etab-1',
    );

    expect(resultat[0]).toMatchObject({
      id: 'partenaire-1',
      nom: 'Université de Toliara',
      adresse: 'Maninday',
      raisons_doublon: ['nom identique', 'pays identique'],
    });
  });

  it('signale les noms proches sans les bloquer comme doublons exacts', async () => {
    const { service } = creerService({
      partenaires: [
        {
          id: 'partenaire-proche',
          nom: 'Université d’Antananarivo',
          pays: 'Madagascar',
          type: 'Université',
          etablissement_id: 'etab-1',
          archive: false,
          cree_par_role: Role.PRESIDENCE,
          soumis_le: null,
        },
      ],
    });

    const resultat = await service.verifierNom(
      'Université d’Antananariv',
      Role.PRESIDENCE,
    );

    expect(resultat.doublon_exact).toBe(false);
    expect(resultat.similaires[0]?.id).toBe('partenaire-proche');
  });

  it('indique un doublon global sans divulguer les fiches hors périmètre établissement', async () => {
    const { service } = creerService({
      partenaires: [
        {
          id: 'partenaire-cache',
          nom: 'Agence Nationale de Recherche',
          pays: 'Madagascar',
          type: 'Agence',
          etablissement_id: 'etab-autre',
          archive: false,
          cree_par_role: Role.ETABLISSEMENT,
          soumis_le: null,
        },
        {
          id: 'partenaire-proche-visible',
          nom: 'Agence Nationale pour la Recherche',
          pays: 'Madagascar',
          type: 'Agence',
          etablissement_id: 'etab-courant',
          archive: false,
          cree_par_role: Role.ETABLISSEMENT,
          soumis_le: null,
        },
      ],
    });

    const resultat = await service.verifierNom(
      'AGENCE NATIONALE DE RECHERCHE',
      Role.ETABLISSEMENT,
      'etab-courant',
      { etablissementId: 'etab-courant' },
    );

    expect(resultat).toEqual({
      doublon_exact: true,
      correspondants: [],
      similaires: [],
    });
  });

  it('refuse un changement de nom vers un nom déjà pris', async () => {
    const { service } = creerService({
      partenaires: [
        {
          id: 'partenaire-autre',
          nom: 'Université d’Antananarivo',
          archive: false,
        },
      ],
    });
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'partenaire-modifie',
      nom: 'Institut de recherche',
      pays: 'Madagascar',
    } as Partenaire);

    await expect(
      service.update('partenaire-modifie', {
        nom: ' UNIVERSITE d’Antananarivo ',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('ne vérifie pas le doublon quand un partenaire conserve son nom', async () => {
    const { service, coordonnees } = creerService();
    const partenaire = {
      id: 'partenaire-1',
      nom: 'Université d’Antananarivo',
      pays: 'Madagascar',
      cree_par_role: Role.PRESIDENCE,
      soumis_le: null,
    } as Partenaire;
    jest.spyOn(service, 'findOne').mockResolvedValue(partenaire);
    const verification = jest.spyOn(service as any, 'verifierDoublonNom');

    await service.update('partenaire-1', {
      nom: ' UNIVERSITE  d’Antananarivo ',
    });

    expect(verification).not.toHaveBeenCalled();
    expect(coordonnees.synchroniserPartenaire).toHaveBeenCalled();
  });
});
