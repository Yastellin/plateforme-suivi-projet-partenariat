import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Etablissement } from './entities/etablissement.entity';

@Injectable()
export class EtablissementsService {
  constructor(
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    recherche?: string,
  ): Promise<{
    data: Etablissement[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where = recherche
      ? [{ nom: ILike(`%${recherche}%`) }, { sigle: ILike(`%${recherche}%`) }]
      : {};

    const [data, total] = await this.etablissementRepo.findAndCount({
      where,
      order: { nom: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Etablissement> {
    const etablissement = await this.etablissementRepo.findOne({
      where: { id },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement non trouvé');
    }
    return etablissement;
  }
}
