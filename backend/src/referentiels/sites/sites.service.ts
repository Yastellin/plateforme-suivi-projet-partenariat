import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from './entities/site.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private siteRepo: Repository<Site>,
  ) {}

  async create(dto: CreateSiteDto): Promise<Site> {
    const existant = await this.siteRepo.findOne({
      where: { nom: ILike(dto.nom) },
    });
    if (existant) {
      throw new ConflictException(`Un site nomme "${dto.nom}" existe deja`);
    }
    const site = this.siteRepo.create({
      nom: dto.nom,
      description: dto.description ?? null,
    });
    return this.siteRepo.save(site);
  }

  async findAll(nom?: string): Promise<Site[]> {
    const where = nom ? { nom: ILike(`%${nom}%`) } : {};
    return this.siteRepo.find({ where, order: { nom: 'ASC' } });
  }

  async findOne(id: string): Promise<Site> {
    const site = await this.siteRepo.findOne({ where: { id } });
    if (!site) throw new NotFoundException('Site non trouve');
    return site;
  }

  async update(id: string, dto: UpdateSiteDto): Promise<Site> {
    await this.findOne(id);
    if (dto.nom) {
      const existant = await this.siteRepo.findOne({
        where: { nom: ILike(dto.nom) },
      });
      if (existant && existant.id !== id) {
        throw new ConflictException(`Un site nomme "${dto.nom}" existe deja`);
      }
    }
    await this.siteRepo.update(id, {
      nom: dto.nom,
      description: dto.description !== undefined ? dto.description : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.siteRepo.delete(id);
    return { message: 'Site supprime' };
  }
}