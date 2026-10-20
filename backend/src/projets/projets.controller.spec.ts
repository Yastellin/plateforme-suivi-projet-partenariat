import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';
import { Role } from '../common/enums/role.enum';

describe('ProjetsController', () => {
  let controller: ProjetsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    getAvancement: jest.Mock;
    update: jest.Mock;
    soumettre: jest.Mock;
    archiver: jest.Mock;
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
      getAvancement: jest.fn().mockResolvedValue({ avancement: 0 }),
      update: jest.fn().mockResolvedValue({ id: 'p1' }),
      soumettre: jest.fn().mockResolvedValue({ id: 'p1' }),
      archiver: jest.fn().mockResolvedValue({ id: 'p1' }),
    };
    controller = new ProjetsController(service as unknown as ProjetsService);
  });

  describe('create', () => {
    it('utilise l etablissement de l utilisateur ETABLISSEMENT', async () => {
      await controller.create(
        { role: Role.ETABLISSEMENT, etablissement_id: 'etab-1' },
        dto,
      );

      expect(service.create).toHaveBeenCalledWith('etab-1', dto);
    });

    it('exige un etablissement cible pour la PRESIDENCE', async () => {
      expect(() => controller.create({ role: Role.PRESIDENCE }, dto)).toThrow(
        BadRequestException,
      );

      expect(service.create).not.toHaveBeenCalled();
    });

    it('accepte la PRESIDENCE lorsqu un etablissement est fourni', async () => {
      await controller.create(
        { role: Role.PRESIDENCE },
        { ...dto, etablissement_id: 'etab-2' },
      );

      expect(service.create).toHaveBeenCalledWith('etab-2', expect.anything());
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

      expect(service.findAll).toHaveBeenCalledWith({}, 'etab-1');
    });

    it('ne filtre pas pour les autres roles', async () => {
      await controller.findAll({ role: Role.DECIDEUR }, {});

      expect(service.findAll).toHaveBeenCalledWith({}, undefined);
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

  describe('archiver', () => {
    it('delegue l archivage au service', async () => {
      await controller.archiver('p1');

      expect(service.archiver).toHaveBeenCalledWith('p1');
    });
  });
});
