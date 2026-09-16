import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConventionExpirationRule } from './rules/convention-expiration.rule';
import { ConventionExpireeRule } from './rules/convention-expiree.rule';
import { ProjetRetardRule } from './rules/projet-retard.rule';

@Injectable()
export class NotificationsSchedulerService {
  private readonly logger = new Logger(NotificationsSchedulerService.name);

  constructor(
    private conventionExpirationRule: ConventionExpirationRule,
    private conventionExpireeRule: ConventionExpireeRule,
    private projetRetardRule: ProjetRetardRule,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async executerToutesLesRegles(): Promise<void> {
    this.logger.log('Execution des regles de notification...');
    try {
      await this.conventionExpirationRule.verifier();
      await this.conventionExpireeRule.verifier();
      await this.projetRetardRule.verifier();
      this.logger.log('Fin de l execution des regles de notification.');
    } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    this.logger.error(`Erreur lors de l execution des regles : ${message}`);
    }
  }
}