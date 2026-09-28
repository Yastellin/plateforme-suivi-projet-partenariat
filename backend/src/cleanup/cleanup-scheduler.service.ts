import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';

@Injectable()
export class CleanupSchedulerService {
  private readonly logger = new Logger(CleanupSchedulerService.name);

  constructor(private cleanupService: CleanupService) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async executerNettoyage(): Promise<void> {
    this.logger.log('Debut du nettoyage automatique des fichiers orphelins...');
    try {
      await this.cleanupService.nettoyerFichiersOrphelins();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Erreur lors du nettoyage automatique : ${message}`);
    }
  }
}