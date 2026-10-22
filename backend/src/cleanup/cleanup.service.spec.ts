import { CleanupService } from './cleanup.service';

describe('CleanupService', () => {
  it('conserve les logos référencés et supprime uniquement les vrais orphelins', async () => {
    const ancienneDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const storage = {
      listerFichiers: jest.fn().mockResolvedValue([
        {
          url: '/uploads/logos/partenaires/partenaire.png',
          cheminComplet: '/tmp/partenaire.png',
          taille: 100,
          date_modification: ancienneDate,
        },
        {
          url: '/uploads/logos/etablissements/etablissement.png',
          cheminComplet: '/tmp/etablissement.png',
          taille: 100,
          date_modification: ancienneDate,
        },
        {
          url: '/uploads/logos/presidence.png',
          cheminComplet: '/tmp/presidence.png',
          taille: 100,
          date_modification: ancienneDate,
        },
        {
          url: '/uploads/logos/orphelin.png',
          cheminComplet: '/tmp/orphelin.png',
          taille: 100,
          date_modification: ancienneDate,
        },
      ]),
      supprimer: jest.fn().mockResolvedValue(undefined),
    };
    const repo = (resultat: unknown[]) => ({
      find: jest.fn().mockResolvedValue(resultat),
    });
    const service = new CleanupService(
      repo([]) as never,
      repo([]) as never,
      repo([
        { logo_url: '/uploads/logos/partenaires/partenaire.png' },
      ]) as never,
      repo([
        { logo_url: '/uploads/logos/etablissements/etablissement.png' },
      ]) as never,
      repo([{ logo_url: '/uploads/logos/presidence.png' }]) as never,
      storage as never,
    );

    const resultat = await service.nettoyerFichiersOrphelins();

    expect(storage.supprimer).toHaveBeenCalledTimes(1);
    expect(storage.supprimer).toHaveBeenCalledWith(
      '/uploads/logos/orphelin.png',
    );
    expect(resultat).toMatchObject({ examines: 4, conserves: 3, supprimes: 1 });
  });
});
