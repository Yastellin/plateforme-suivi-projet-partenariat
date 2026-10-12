import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etablissement } from './entities/etablissement.entity';

@Injectable()
export class EtablissementsService {
  constructor(
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
  ) {}

  async findAll(): Promise<Etablissement[]> {
    return this.etablissementRepo.find({
      order: { nom: 'ASC' },
    });
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
