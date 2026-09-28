import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';
import { BeneficiaireResponseDto } from './dto/beneficiaire-response.dto';

@Injectable()
export class BeneficiairesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBeneficiaireDto): Promise<BeneficiaireResponseDto> {
    const existant = await this.prisma.beneficiaire.findFirst({
      where: { nom: { equals: dto.nom, mode: 'insensitive' } },
    });
    if (existant) {
      throw new ConflictException(`Un beneficiaire nomme "${dto.nom}" existe deja`);
    }

    return this.prisma.beneficiaire.create({
      data: {
        nom: dto.nom,
        categorie: dto.categorie,
        description: dto.description,
      },
    });
  }

  async findAll(nom?: string): Promise<BeneficiaireResponseDto[]> {
    const where: any = {};
    if (nom) where.nom = { contains: nom, mode: 'insensitive' };
    return this.prisma.beneficiaire.findMany({
      where,
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string): Promise<BeneficiaireResponseDto> {
    const beneficiaire = await this.prisma.beneficiaire.findUnique({ where: { id } });
    if (!beneficiaire) throw new NotFoundException('Beneficiaire non trouve');
    return beneficiaire;
  }

  async update(id: string, dto: UpdateBeneficiaireDto): Promise<BeneficiaireResponseDto> {
    await this.findOne(id);

    if (dto.nom) {
      const existant = await this.prisma.beneficiaire.findFirst({
        where: {
          nom: { equals: dto.nom, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existant) {
        throw new ConflictException(`Un beneficiaire nomme "${dto.nom}" existe deja`);
      }
    }

    return this.prisma.beneficiaire.update({
      where: { id },
      data: {
        nom: dto.nom,
        categorie: dto.categorie,
        description: dto.description,
      },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const projetsAssocies = await this.prisma.projetBeneficiaire.count({
      where: { beneficiaire_id: id },
    });
    if (projetsAssocies > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce beneficiaire : ${projetsAssocies} projet(s) y sont associes`,
      );
    }

    await this.prisma.beneficiaire.delete({ where: { id } });
    return { message: 'Beneficiaire supprime' };
  }
}