import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from '../auth/entities/utilisateur.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Document } from '../documents/entities/document.entity';
import { Activite } from '../projets/entities/activite.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsSchedulerService } from './notifications-scheduler.service';
import { ConventionExpirationRule } from './rules/convention-expiration.rule';
import { ConventionExpireeRule } from './rules/convention-expiree.rule';
import { ProjetRetardRule } from './rules/projet-retard.rule';
import { SoumissionListener } from './listeners/soumission.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      Utilisateur,
      Convention,
      Projet,
      Activite,
      Document,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsSchedulerService,
    ConventionExpirationRule,
    ConventionExpireeRule,
    ProjetRetardRule,
    SoumissionListener,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}