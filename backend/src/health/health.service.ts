import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly dateDemarrage = new Date();

  constructor(private prisma: PrismaService) {}

  async check() {
    const baseOk = await this.verifierBase();

    const resultat = {
      status: baseOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime_secondes: Math.floor((Date.now() - this.dateDemarrage.getTime()) / 1000),
      dependances: {
        base_de_donnees: baseOk ? 'ok' : 'indisponible',
      },
    };

    if (!baseOk) {
      throw new ServiceUnavailableException(resultat);
    }

    return resultat;
  }

  private async verifierBase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Base de donnees indisponible : ${message}`);
      return false;
    }
  }
}