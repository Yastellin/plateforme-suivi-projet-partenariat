import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateBailleurDto } from './dto/create-bailleur.dto';
import { UpdateBailleurDto } from './dto/update-bailleur.dto';
import { Bailleur } from './entities/bailleur.entity';

@Injectable()
export class BailleursService {
  constructor(
    @InjectRepository(Bailleur)
    private bailleurRepo: Repository<Bailleur>,
  ) {}

  async create(dto: CreateBailleurDto): Promise<Bailleur> {
    const existant = await this.bailleurRepo.findOne({
      where: { nom: ILike(dto.nom) },
    });
    if (existant) {
      throw new ConflictException(`Un bailleur nomme "${dto.nom}" existe deja`);
    }
    const bailleur = this.bailleurRepo.create({
      nom: dto.nom,
      description: dto.description ?? null,
    });
    return this.bailleurRepo.save(bailleur);
  }

  async findAll(nom?: string): Promise<Bailleur[]> {
    const where = nom ? { nom: ILike(`%${nom}%`) } : {};
    return this.bailleurRepo.find({ where, order: { nom: 'ASC' } });
  }

  async findOne(id: string): Promise<Bailleur> {
    const bailleur = await this.bailleurRepo.findOne({ where: { id } });
    if (!bailleur) throw new NotFoundException('Bailleur non trouve');
    return bailleur;
  }

  async update(id: string, dto: UpdateBailleurDto): Promise<Bailleur> {
    await this.findOne(id);
    if (dto.nom) {
      const existant = await this.bailleurRepo.findOne({
        where: { nom: ILike(dto.nom) },
      });
      if (existant && existant.id !== id) {
        throw new ConflictException(`Un bailleur nomme "${dto.nom}" existe deja`);
      }
    }
    await this.bailleurRepo.update(id, {
      nom: dto.nom,
      description: dto.description !== undefined ? dto.description : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.bailleurRepo.delete(id);
    return { message: 'Bailleur supprime' };
  }
}