import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsSchedulerService } from './notifications-scheduler.service';
import { ConventionExpirationRule } from './rules/convention-expiration.rule';
import { ConventionExpireeRule } from './rules/convention-expiree.rule';
import { ProjetRetardRule } from './rules/projet-retard.rule';
import { SoumissionListener } from './listeners/soumission.listener';

@Module({
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