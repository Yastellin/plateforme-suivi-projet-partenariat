import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';
import { DemandesModificationProjetService } from './demandes-modification-projet.service';
import { DecisionDemandeModificationProjet } from './demandes-modification-projet.constants';
import { Role } from '../common/enums/role.enum';

describe('ProjetsController', () => {
  let controller: ProjetsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    soumettre: jest.Mock;
    archiver: jest.Mock;
  };
  let demandesModification: {
    demander: jest.Mock;
    traiter: jest.Mock;
  };

  const dto = {
    nom: 'Projet Biodiversité',
    type: 'Recherche',
    date_debut: '2026-01-15T00:00:00.000Z',
    date_fin_prevue: '2026-12-30T00:00:00.000Z',
  };

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
      update: jest.fn().mockResolvedValue({ id: 'p1' }),
      soumettre: jest.fn().mockResolvedValue({ id: 'p1' }),
      archiver: jest.fn().mockResolvedValue({ id: 'p1' }),
    };
    demandesModification = {
      demander: jest.fn().mockResolvedValue({ projet_id: 'p1' }),
      traiter: jest.fn().mockResolvedValue({ projet_id: 'p1' }),
    };
    controller = new ProjetsController(
      service as unknown as ProjetsService,
      demandesModification as unknown as DemandesModificationProjetService,
    );
  });

  describe('create', () => {
    it('utilise l etablissement de l utilisateur ETABLISSEMENT', async () => {
      await controller.create(
        { role: Role.ETABLISSEMENT, etablissement_id: 'etab-1' },
        dto,
      );

      expect(service.create).toHaveBeenCalledWith(
        'etab-1',
        dto,
        expect.objectContaining({ role: Role.ETABLISSEMENT }),
      );
    });

    it('accepte la PRESIDENCE sans etablissement (projet transversal)', async () => {
      await controller.create({ role: Role.PRESIDENCE }, dto);

      expect(service.create).toHaveBeenCalledWith(
        null,
        dto,
        expect.objectContaining({ role: Role.PRESIDENCE }),
      );
    });

    it('accepte la PRESIDENCE lorsqu un etablissement est fourni', async () => {
      await controller.create(
        { role: Role.PRESIDENCE },
        { ...dto, etablissement_id: 'etab-2' },
      );

      expect(service.create).toHaveBeenCalledWith(
        'etab-2',
        expect.anything(),
        expect.objectContaining({ role: Role.PRESIDENCE }),
      );
    });

    it('rejette un compte ETABLISSEMENT sans etablissement rattache', async () => {
      expect(() =>
        controller.create(
          { role: Role.ETABLISSEMENT, etablissement_id: null },
          dto,
        ),
      ).toThrow(BadRequestException);
    });

    it('rejette tout autre role', async () => {
      expect(() => controller.create({ role: Role.DECIDEUR }, dto)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('restreint la liste a l etablissement du compte ETABLISSEMENT', async () => {
      await controller.findAll(
        { role: Role.ETABLISSEMENT, etablissement_id: 'etab-1' },
        {},
      );

      expect(service.findAll).toHaveBeenCalledWith(
        {},
        {
          etablissementId: 'etab-1',
        },
      );
    });

    it('restreint la liste générale aux données de la Présidence', async () => {
      await controller.findAll({ role: Role.PRESIDENCE }, {});

      expect(service.findAll).toHaveBeenCalledWith(
        {},
        {
          origine: Role.PRESIDENCE,
          etatSoumission: 'NON_SOUMISES',
        },
      );
    });

    it("expose les données soumises dans la section d'un établissement", async () => {
      const query = { etablissement_id: 'etab-1' };

      await controller.findAll({ role: Role.PRESIDENCE }, query);

      expect(service.findAll).toHaveBeenCalledWith(query, {
        etablissementId: 'etab-1',
        etatSoumission: 'SOUMISES',
      });
    });

    it('ne force pas de périmètre pour le décideur', async () => {
      await controller.findAll({ role: Role.DECIDEUR }, {});

      expect(service.findAll).toHaveBeenCalledWith({}, {});
    });
  });

  describe('findOne', () => {
    it('transmet l etablissement du compte pour verifier la propriete', async () => {
      await controller.findOne(
        { role: Role.ETABLISSEMENT, etablissement_id: 'etab-1' },
        'p1',
      );

      expect(service.findOne).toHaveBeenCalledWith('p1', 'etab-1');
    });
  });

  describe('update', () => {
    it('transmet le role Présidence sans restriction établissement', async () => {
      const modification = { nom: 'Projet Présidence actualisé' };

      await controller.update(
        {
          id: 'utilisateur-presidence',
          email: 'presidence@univ-fianarantsoa.mg',
          role: Role.PRESIDENCE,
        },
        'p1',
        modification,
      );

      expect(service.update).toHaveBeenCalledWith(
        'p1',
        modification,
        Role.PRESIDENCE,
        undefined,
        {
          id: 'utilisateur-presidence',
          email: 'presidence@univ-fianarantsoa.mg',
          role: Role.PRESIDENCE,
        },
      );
    });

    it("transmet l'établissement propriétaire et son rôle", async () => {
      const modification = { nom: 'Projet établissement actualisé' };

      await controller.update(
        {
          id: 'utilisateur-etablissement',
          email: 'direction@univ-toliara.mg',
          role: Role.ETABLISSEMENT,
          etablissement_id: 'etab-1',
        },
        'p1',
        modification,
      );

      expect(service.update).toHaveBeenCalledWith(
        'p1',
        modification,
        Role.ETABLISSEMENT,
        'etab-1',
        {
          id: 'utilisateur-etablissement',
          email: 'direction@univ-toliara.mg',
          role: Role.ETABLISSEMENT,
        },
      );
    });
  });

  describe('demandes de modification', () => {
    const utilisateurEtablissement = {
      id: 'utilisateur-etablissement',
      email: 'rakoto@univ-toliara.mg',
      role: Role.ETABLISSEMENT,
      etablissement_id: 'etab-1',
    };
    const utilisateurPresidence = {
      id: 'utilisateur-presidence',
      email: 'presidence@example.mg',
      role: Role.PRESIDENCE,
    };

    it("transmet le motif et l'établissement lors d'une demande", async () => {
      await controller.demanderModification(utilisateurEtablissement, 'p1', {
        motif: 'Le budget doit être actualisé.',
      });

      expect(demandesModification.demander).toHaveBeenCalledWith(
        'p1',
        'Le budget doit être actualisé.',
        'etab-1',
        expect.objectContaining({
          id: 'utilisateur-etablissement',
          role: Role.ETABLISSEMENT,
        }),
      );
    });

    it('transmet les décisions de la Présidence', async () => {
      await controller.approuverDemandeModification(
        utilisateurPresidence,
        'p1',
      );
      await controller.rejeterDemandeModification(utilisateurPresidence, 'p1');

      expect(demandesModification.traiter).toHaveBeenNthCalledWith(
        1,
        'p1',
        DecisionDemandeModificationProjet.APPROUVEE,
        expect.objectContaining({ role: Role.PRESIDENCE }),
      );
      expect(demandesModification.traiter).toHaveBeenNthCalledWith(
        2,
        'p1',
        DecisionDemandeModificationProjet.REJETEE,
        expect.objectContaining({ role: Role.PRESIDENCE }),
      );
    });
  });

  describe('archiver', () => {
    it('delegue l archivage au service', async () => {
      await controller.archiver(
        {
          id: 'presidence-1',
          email: 'presidence@example.mg',
          role: Role.PRESIDENCE,
        },
        'p1',
      );

      expect(service.archiver).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ id: 'presidence-1', role: Role.PRESIDENCE }),
      );
    });
  });
});
