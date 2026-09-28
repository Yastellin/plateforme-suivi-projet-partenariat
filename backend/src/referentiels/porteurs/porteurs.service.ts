import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePorteurDto } from './dto/create-porteur.dto';
import { UpdatePorteurDto } from './dto/update-porteur.dto';
import { PorteurResponseDto } from './dto/porteur-response.dto';

@Injectable()
export class PorteursService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePorteurDto): Promise<PorteurResponseDto> {
    const existant = await this.prisma.porteur.findFirst({
      where: { nom: { equals: dto.nom, mode: 'insensitive' } },
    });
    if (existant) {
      throw new ConflictException(`Un porteur nomme "${dto.nom}" existe deja`);
    }

    return this.prisma.porteur.create({
      data: {
        nom: dto.nom,
        institution_rattachement: dto.institution_rattachement,
      },
    });
  }

  async findAll(nom?: string): Promise<PorteurResponseDto[]> {
    const where: any = {};
    if (nom) where.nom = { contains: nom, mode: 'insensitive' };
    return this.prisma.porteur.findMany({
      where,
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string): Promise<PorteurResponseDto> {
    const porteur = await this.prisma.porteur.findUnique({ where: { id } });
    if (!porteur) throw new NotFoundException('Porteur non trouve');
    return porteur;
  }

  async update(id: string, dto: UpdatePorteurDto): Promise<PorteurResponseDto> {
    await this.findOne(id);

    if (dto.nom) {
      const existant = await this.prisma.porteur.findFirst({
        where: {
          nom: { equals: dto.nom, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existant) {
        throw new ConflictException(`Un porteur nomme "${dto.nom}" existe deja`);
      }
    }

    return this.prisma.porteur.update({
      where: { id },
      data: {
        nom: dto.nom,
        institution_rattachement: dto.institution_rattachement,
      },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const projetsAssocies = await this.prisma.projet.count({
      where: { porteur_id: id },
    });
    if (projetsAssocies > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce porteur : ${projetsAssocies} projet(s) y sont associes`,
      );
    }

    await this.prisma.porteur.delete({ where: { id } });
    return { message: 'Porteur supprime' };
  }
}