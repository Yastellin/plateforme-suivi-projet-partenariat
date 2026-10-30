import { ConventionsService } from './conventions.service';
import { Convention } from './entities/convention.entity';
import { Projet } from '../projets/entities/projet.entity';
import { CreateConventionDto } from './dto/create-convention.dto';

describe('ConventionsService', () => {
  it('génère des références uniques sans les recevoir du client', async () => {
    let identifiant = 0;
    const conventionRepo = {
      create: jest.fn((valeurs: Partial<Convention>) => valeurs),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn((valeurs: Partial<Convention>) =>
        Promise.resolve({
          ...valeurs,
          id: `convention-${++identifiant}`,
        }),
      ),
    };
    const projetRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'projet-1' }),
    };
    const manager = {
      getRepository: jest.fn((entite: unknown) => {
        if (entite === Convention) return conventionRepo;
        if (entite === Projet) return projetRepo;
        return { findOne: jest.fn(), update: jest.fn() };
      }),
    };
    const dataSource = {
      transaction: jest.fn(
        (operation: (gestionnaire: typeof manager) => unknown) =>
          Promise.resolve(operation(manager)),
      ),
    };
    const service = new ConventionsService(
      conventionRepo as any,
      {} as any,
      {} as any,
      {} as any,
      dataSource as any,
      {} as any,
    );
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({ id: 'convention' } as any);

    const dto = Object.assign(new CreateConventionDto(), {
      titre: 'Convention de test',
      projet_id: 'projet-1',
    });
    await service.create(dto);
    await service.create(dto);

    const references = conventionRepo.create.mock.calls.map(
      ([valeurs]) => valeurs.reference,
    );
    expect(references).toHaveLength(2);
    expect(references[0]).toMatch(/^CONV-\d{4}-[0-9A-F-]{36}$/);
    expect(references[1]).not.toBe(references[0]);
  });
});
