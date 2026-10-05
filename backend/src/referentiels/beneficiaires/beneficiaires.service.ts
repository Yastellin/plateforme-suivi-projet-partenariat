import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';
import { Beneficiaire } from './entities/beneficiaire.entity';

@Injectable()
export class BeneficiairesService {
  constructor(
    @InjectRepository(Beneficiaire)
    private beneficiaireRepo: Repository<Beneficiaire>,
  ) {}

  async create(dto: CreateBeneficiaireDto): Promise<Beneficiaire> {
    const existant = await this.beneficiaireRepo.findOne({
      where: { nom: ILike(dto.nom) },
    });
    if (existant) {
      throw new ConflictException(`Un beneficiaire nomme "${dto.nom}" existe deja`);
    }
    const b = this.beneficiaireRepo.create({
      nom: dto.nom,
      categorie: dto.categorie ?? null,
      description: dto.description ?? null,
    });
    return this.beneficiaireRepo.save(b);
  }

  async findAll(nom?: string): Promise<Beneficiaire[]> {
    const where = nom ? { nom: ILike(`%${nom}%`) } : {};
    return this.beneficiaireRepo.find({ where, order: { nom: 'ASC' } });
  }

  async findOne(id: string): Promise<Beneficiaire> {
    const b = await this.beneficiaireRepo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Beneficiaire non trouve');
    return b;
  }

  async update(id: string, dto: UpdateBeneficiaireDto): Promise<Beneficiaire> {
    await this.findOne(id);
    if (dto.nom) {
      const existant = await this.beneficiaireRepo.findOne({
        where: { nom: ILike(dto.nom) },
      });
      if (existant && existant.id !== id) {
        throw new ConflictException(`Un beneficiaire nomme "${dto.nom}" existe deja`);
      }
    }
    await this.beneficiaireRepo.update(id, {
      nom: dto.nom,
      categorie: dto.categorie !== undefined ? dto.categorie : undefined,
      description: dto.description !== undefined ? dto.description : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.beneficiaireRepo.delete(id);
    return { message: 'Beneficiaire supprime' };
  }
}