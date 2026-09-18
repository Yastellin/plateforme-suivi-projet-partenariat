import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteResponseDto } from './dto/site-response.dto';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSiteDto): Promise<SiteResponseDto> {
    const existant = await this.prisma.site.findFirst({
      where: { nom: { equals: dto.nom, mode: 'insensitive' } },
    });
    if (existant) {
      throw new ConflictException(`Un site nomme "${dto.nom}" existe deja`);
    }

    return this.prisma.site.create({
      data: { nom: dto.nom, description: dto.description },
    });
  }

  async findAll(nom?: string): Promise<SiteResponseDto[]> {
    const where: any = {};
    if (nom) where.nom = { contains: nom, mode: 'insensitive' };
    return this.prisma.site.findMany({
      where,
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string): Promise<SiteResponseDto> {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site non trouve');
    return site;
  }

  async update(id: string, dto: UpdateSiteDto): Promise<SiteResponseDto> {
    await this.findOne(id);

    if (dto.nom) {
      const existant = await this.prisma.site.findFirst({
        where: {
          nom: { equals: dto.nom, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existant) {
        throw new ConflictException(`Un site nomme "${dto.nom}" existe deja`);
      }
    }

    return this.prisma.site.update({
      where: { id },
      data: { nom: dto.nom, description: dto.description },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const projetsAssocies = await this.prisma.projetSite.count({
      where: { site_id: id },
    });
    if (projetsAssocies > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce site : ${projetsAssocies} projet(s) y sont associes`,
      );
    }

    await this.prisma.site.delete({ where: { id } });
    return { message: 'Site supprime' };
  }
}