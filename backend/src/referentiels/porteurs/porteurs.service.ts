import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreatePorteurDto } from './dto/create-porteur.dto';
import { UpdatePorteurDto } from './dto/update-porteur.dto';
import { Porteur } from './entities/porteur.entity';

@Injectable()
export class PorteursService {
  constructor(
    @InjectRepository(Porteur)
    private porteurRepo: Repository<Porteur>,
  ) {}

  async create(dto: CreatePorteurDto): Promise<Porteur> {
    const existant = await this.porteurRepo.findOne({
      where: { nom: ILike(dto.nom) },
    });
    if (existant) {
      throw new ConflictException(`Un porteur nomme "${dto.nom}" existe deja`);
    }

    const porteur = this.porteurRepo.create({
      nom: dto.nom,
      institution_rattachement: dto.institution_rattachement ?? null,
    });
    return this.porteurRepo.save(porteur);
  }

  async findAll(nom?: string): Promise<Porteur[]> {
    const where = nom ? { nom: ILike(`%${nom}%`) } : {};
    return this.porteurRepo.find({
      where,
      order: { nom: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Porteur> {
    const porteur = await this.porteurRepo.findOne({ where: { id } });
    if (!porteur) throw new NotFoundException('Porteur non trouve');
    return porteur;
  }

  async update(id: string, dto: UpdatePorteurDto): Promise<Porteur> {
    await this.findOne(id);

    if (dto.nom) {
      const existant = await this.porteurRepo.findOne({
        where: { nom: ILike(dto.nom) },
      });
      if (existant && existant.id !== id) {
        throw new ConflictException(`Un porteur nomme "${dto.nom}" existe deja`);
      }
    }

    await this.porteurRepo.update(id, {
      nom: dto.nom,
      institution_rattachement:
        dto.institution_rattachement !== undefined ? dto.institution_rattachement : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    // Verification des projets associes : a reactiver quand Projet sera migre.
    // Pour l'instant, on se repose sur la contrainte PostgreSQL existante.

    await this.porteurRepo.delete(id);
    return { message: 'Porteur supprime' };
  }
}