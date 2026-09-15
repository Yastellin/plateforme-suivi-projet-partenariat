import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvancementService {
  constructor(private prisma: PrismaService) {}

  async calculer(projetId: string): Promise<number> {
    const total = await this.prisma.activite.count({
      where: { projet_id: projetId },
    });
    if (total === 0) return 0;

    const terminees = await this.prisma.activite.count({
      where: { projet_id: projetId, terminee: true },
    });

    return Math.round((terminees / total) * 100);
  }
}