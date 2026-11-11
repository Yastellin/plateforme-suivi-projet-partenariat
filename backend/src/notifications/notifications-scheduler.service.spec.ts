import { Repository } from 'typeorm';
import { Convention } from '../conventions/entities/convention.entity';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { Projet } from '../projets/entities/projet.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsSchedulerService } from './notifications-scheduler.service';
import { ConventionExpireeRule } from './rules/convention-expiree.rule';
import { ConventionExpirationRule } from './rules/convention-expiration.rule';
import { ProjetRetardRule } from './rules/projet-retard.rule';

describe('NotificationsSchedulerService', () => {
  it('traite les conventions expirées et projets en retard sans notifier les conventions anciennes', async () => {
    const maintenant = new Date();
    const dateIlYADixJours = new Date(
      maintenant.getTime() - 10 * 24 * 60 * 60 * 1000,
    );
    const dateIlYAFortyJours = new Date(
      maintenant.getTime() - 40 * 24 * 60 * 60 * 1000,
    );
    const conventionRecente = {
      id: 'convention-recente',
      reference: 'CONV-2026-RECENTE',
      titre: 'Convention récemment expirée',
      date_fin: dateIlYADixJours,
      projet_id: null,
    } as Convention;
    const conventionAncienne = {
      id: 'convention-ancienne',
      reference: 'CONV-2025-ANCIENNE',
      titre: 'Convention expirée depuis longtemps',
      date_fin: dateIlYAFortyJours,
      projet_id: null,
    } as Convention;
    const projetEnRetard = {
      id: 'projet-en-retard',
      nom: 'Projet en retard',
      statut: StatutProjet.EN_COURS,
      date_fin_prevue: dateIlYADixJours,
      etablissement_id: 'etablissement-1',
    } as Projet;

    const conventionRepoMock = {
      find: jest
        .fn()
        .mockResolvedValueOnce([conventionRecente, conventionAncienne])
        .mockResolvedValueOnce([]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const projetRepoMock = {
      find: jest.fn().mockResolvedValue([projetEnRetard]),
      findOne: jest.fn(),
    };
    const notificationMocks = {
      creer: jest.fn().mockResolvedValue(null),
      trouverUtilisateursPresidence: jest
        .fn()
        .mockResolvedValue(['utilisateur-presidence']),
      trouverUtilisateursEtablissement: jest
        .fn()
        .mockResolvedValue(['utilisateur-etablissement']),
    };

    const conventionRepo =
      conventionRepoMock as unknown as Repository<Convention>;
    const projetRepo = projetRepoMock as unknown as Repository<Projet>;
    const notifications = notificationMocks as unknown as NotificationsService;
    const regleConventionExpiree = new ConventionExpireeRule(
      conventionRepo,
      projetRepo,
      notifications,
    );
    const regleExpirationConvention = new ConventionExpirationRule(
      conventionRepo,
      projetRepo,
      notifications,
    );
    const regleProjetRetard = new ProjetRetardRule(projetRepo, notifications);
    const tache = new NotificationsSchedulerService(
      regleConventionExpiree,
      regleExpirationConvention,
      regleProjetRetard,
    );

    await tache.executerToutesLesRegles();

    expect(conventionRepoMock.update).toHaveBeenCalledWith(
      conventionRecente.id,
      { statut: StatutConvention.EXPIREE },
    );
    expect(conventionRepoMock.update).toHaveBeenCalledWith(
      conventionAncienne.id,
      { statut: StatutConvention.EXPIREE },
    );
    expect(notificationMocks.creer).toHaveBeenCalledTimes(3);
    expect(notificationMocks.creer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TypeNotification.CONVENTION_EXPIREE,
        reference_id: conventionRecente.id,
        utilisateur_id: 'utilisateur-presidence',
        fenetreDedupJours: 30,
      }),
    );
    expect(notificationMocks.creer).not.toHaveBeenCalledWith(
      expect.objectContaining({ reference_id: conventionAncienne.id }),
    );
    expect(notificationMocks.creer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TypeNotification.PROJET_RETARD,
        reference_id: projetEnRetard.id,
        utilisateur_id: 'utilisateur-presidence',
        fenetreDedupJours: 7,
      }),
    );
    expect(notificationMocks.creer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TypeNotification.PROJET_RETARD,
        reference_id: projetEnRetard.id,
        utilisateur_id: 'utilisateur-etablissement',
        fenetreDedupJours: 7,
      }),
    );
  });
});
