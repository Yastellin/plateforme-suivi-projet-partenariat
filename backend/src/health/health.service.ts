import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly dateDemarrage = new Date();

  constructor(private readonly dataSource: DataSource) {}

  async check() {
    const baseOk = await this.verifierBase();

    const resultat = {
      status: baseOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime_secondes: Math.floor(
        (Date.now() - this.dateDemarrage.getTime()) / 1000,
      ),
      dependances: {
        base_de_donnees: baseOk ? 'ok' : 'indisponible',
      },
      // Ce contrat permet au compose de ne pas exposer un frontend récent
      // devant une ancienne image backend qui ne connaît pas encore ces routes.
      contrats: {
        parametres_logos: 'v1',
      },
    };

    if (!baseOk) {
      throw new ServiceUnavailableException(resultat);
    }

    return resultat;
  }

  private async verifierBase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Base de donnees indisponible : ${message}`);
      return false;
    }
  }
}
