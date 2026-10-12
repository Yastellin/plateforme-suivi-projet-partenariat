import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSchedulerService {
  private readonly logger = new Logger(AuthSchedulerService.name);

  constructor(private authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async nettoyerTokensExpires(): Promise<void> {
    this.logger.log('Nettoyage des refresh tokens expires...');
    try {
      const resultat = await this.authService.nettoyerTokensExpires();
      this.logger.log(`${resultat.supprimes} refresh token(s) supprime(s).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Erreur lors du nettoyage : ${message}`);
    }
  }
}
