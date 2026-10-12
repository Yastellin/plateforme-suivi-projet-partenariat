import { AvancementService } from './avancement.service';
import type { Repository } from 'typeorm';
import type { Activite } from './entities/activite.entity';

describe('AvancementService', () => {
  let service: AvancementService;
  let repo: { count: jest.Mock };

  beforeEach(() => {
    repo = { count: jest.fn() };
    service = new AvancementService(repo as unknown as Repository<Activite>);
  });

  it('renvoie 0 pour un projet sans activite', async () => {
    repo.count.mockResolvedValue(0);

    await expect(service.calculer('projet-1')).resolves.toBe(0);
    // Une seule requete suffit lorsque le projet n'a aucune activite
    expect(repo.count).toHaveBeenCalledTimes(1);
  });

  it('renvoie 100 lorsque toutes les activites sont terminees', async () => {
    repo.count.mockResolvedValueOnce(4).mockResolvedValueOnce(4);

    await expect(service.calculer('projet-1')).resolves.toBe(100);
  });

  it('arrondit le pourcentage a l entier le plus proche', async () => {
    repo.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

    await expect(service.calculer('projet-1')).resolves.toBe(33);
  });

  it('ne depasse jamais 100 %', async () => {
    repo.count.mockResolvedValue(2);

    const resultat = await service.calculer('projet-1');
    expect(resultat).toBeLessThanOrEqual(100);
  });

  it('interroge bien les activites du projet concerne', async () => {
    repo.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    await service.calculer('projet-42');

    expect(repo.count).toHaveBeenNthCalledWith(1, {
      where: { projet_id: 'projet-42' },
    });
    expect(repo.count).toHaveBeenNthCalledWith(2, {
      where: { projet_id: 'projet-42', terminee: true },
    });
  });
});
