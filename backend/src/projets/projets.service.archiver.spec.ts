import { ConflictException } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { StatutProjet } from '../common/enums/statut-projet.enum';

describe('ProjetsService.archiver', () => {
  let service: ProjetsService;
  let projetRepo: { findOneBy: jest.Mock; update: jest.Mock };
  let activiteRepo: { count: jest.Mock };
  let historique: { enregistrer: jest.Mock };

  const creerProjet = (statut: StatutProjet) => ({
    id: 'p1',
    nom: 'Projet test',
    statut,
    archive: false,
    date_fin_prevue: new Date('2030-01-01'),
  });

  beforeEach(() => {
    projetRepo = { findOneBy: jest.fn(), update: jest.fn().mockResolvedValue({}) };
    // Par défaut : 2 activités non terminées sur le projet
    activiteRepo = { count: jest.fn().mockImplementation(({ where }) => Promise.resolve(where.terminee === false ? 2 : 3)) };
    historique = { enregistrer: jest.fn().mockResolvedValue(undefined) };

    service = new ProjetsService(
      projetRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      activiteRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      historique as any,
    );
  });

  it('archive un projet TERMINE même si des activités ne sont pas terminées', async () => {
    projetRepo.findOneBy.mockResolvedValue(creerProjet(StatutProjet.TERMINE));

    const resultat = await service.archiver('p1');

    expect(projetRepo.update).toHaveBeenCalledWith('p1', { archive: true });
    expect(resultat.archive).toBe(true);
  });

  it('bloque l archivage d un projet EN_COURS avec des activités non terminées', async () => {
    projetRepo.findOneBy.mockResolvedValue(creerProjet(StatutProjet.EN_COURS));

    await expect(service.archiver('p1')).rejects.toBeInstanceOf(ConflictException);
    expect(projetRepo.update).not.toHaveBeenCalled();
  });

  it('archive un projet EN_COURS dont toutes les activités sont terminées', async () => {
    activiteRepo.count.mockResolvedValue(0);
    projetRepo.findOneBy.mockResolvedValue(creerProjet(StatutProjet.EN_COURS));

    await service.archiver('p1');

    expect(projetRepo.update).toHaveBeenCalledWith('p1', { archive: true });
  });
});
