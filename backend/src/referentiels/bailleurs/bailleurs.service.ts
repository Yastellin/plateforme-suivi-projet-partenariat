import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';
import { UpdateBailleurDto } from './dto/update-bailleur.dto';
import { BailleurResponseDto } from './dto/bailleur-response.dto';

@Injectable()
export class BailleursService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBailleurDto): Promise<BailleurResponseDto> {
    const existant = await this.prisma.bailleur.findFirst({
      where: { nom: { equals: dto.nom, mode: 'insensitive' } },
    });
    if (existant) {
      throw new ConflictException(`Un bailleur nomme "${dto.nom}" existe deja`);
    }

    return this.prisma.bailleur.create({
      data: { nom: dto.nom, description: dto.description },
    });
  }

  async findAll(nom?: string): Promise<BailleurResponseDto[]> {
    const where: any = {};
    if (nom) where.nom = { contains: nom, mode: 'insensitive' };
    return this.prisma.bailleur.findMany({
      where,
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string): Promise<BailleurResponseDto> {
    const bailleur = await this.prisma.bailleur.findUnique({ where: { id } });
    if (!bailleur) throw new NotFoundException('Bailleur non trouve');
    return bailleur;
  }

  async update(id: string, dto: UpdateBailleurDto): Promise<BailleurResponseDto> {
    await this.findOne(id);

    if (dto.nom) {
      const existant = await this.prisma.bailleur.findFirst({
        where: {
          nom: { equals: dto.nom, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existant) {
        throw new ConflictException(`Un bailleur nomme "${dto.nom}" existe deja`);
      }
    }

    return this.prisma.bailleur.update({
      where: { id },
      data: { nom: dto.nom, description: dto.description },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const projetsAssocies = await this.prisma.projetBailleur.count({
      where: { bailleur_id: id },
    });
    if (projetsAssocies > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce bailleur : ${projetsAssocies} projet(s) y sont associes`,
      );
    }

    await this.prisma.bailleur.delete({ where: { id } });
    return { message: 'Bailleur supprime' };
  }
}