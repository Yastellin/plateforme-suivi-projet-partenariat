import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { QueryArchiveDto } from './dto/query-archive.dto';

@Injectable()
export class ArchivesService {
  constructor(
    @InjectRepository(Partenaire) private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Partenariat) private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Convention) private conventionRepo: Repository<Convention>,
    @InjectRepository(CotutelleThese) private cotutelleRepo: Repository<CotutelleThese>,
  ) {}

  async listerPartenaires(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.partenaireRepo.findAndCount({
      where: {
        archive: true,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerPartenariats(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: FindOptionsWhere<Partenariat> = {
      archive: true,
      ...(etablissementId
        ? { etablissements: { etablissement_id: etablissementId } }
        : {}),
    };
    const [data, total] = await this.partenariatRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
      relations: {
        etablissements: { etablissement: true },
        partenaires: { partenaire: true },
      },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerProjets(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.projetRepo.findAndCount({
      where: {
        archive: true,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerConventions(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: FindOptionsWhere<Convention> = {
      archive: true,
      ...(etablissementId ? { projet: { etablissement_id: etablissementId } } : {}),
    };
    const [data, total] = await this.conventionRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerCotutelles(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.cotutelleRepo.findAndCount({
      where: {
        archive: true,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
