import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activite } from './entities/activite.entity';

@Injectable()
export class AvancementService {
  constructor(
    @InjectRepository(Activite)
    private activiteRepo: Repository<Activite>,
  ) {}

  async calculer(projetId: string): Promise<number> {
    const total = await this.activiteRepo.count({
      where: { projet_id: projetId },
    });
    if (total === 0) return 0;

    const terminees = await this.activiteRepo.count({
      where: { projet_id: projetId, terminee: true },
    });

    return Math.round((terminees / total) * 100);
  }
}
