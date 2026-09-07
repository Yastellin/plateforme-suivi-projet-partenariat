import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartenaireDto } from './dto/create-partenaire.dto';
import { UpdatePartenaireDto } from './dto/update-partenaire.dto';
import { QueryPartenaireDto } from './dto/query-partenaire.dto';
import { PartenaireResponseDto } from './dto/partenaire-response.dto';
import { StatutPartenaire } from '@prisma/client';

@Injectable()
export class PartenairesService {
  constructor(private prisma: PrismaService) {}

  async create(etablissementId: string, dto: CreatePartenaireDto): Promise<PartenaireResponseDto> {
    // Vérification des doublons
    const existant = await this.prisma.partenaire.findFirst({
      where: {
        nom: dto.nom,
        etablissement_id: etablissementId,
        archive: false,
      },
    });
    if (existant) {
      throw new ConflictException(`Un partenaire nommé "${dto.nom}" existe déjà pour cet établissement.`);
    }

    const partenaire = await this.prisma.partenaire.create({
      data: {
        nom: dto.nom,
        type: dto.type,
        pays: dto.pays,
        adresse: dto.adresse,
        telephone: dto.telephone,
        email: dto.email,
        site_web: dto.site_web,
        description: dto.description,
        statut: dto.statut || StatutPartenaire.ACTIF,
        visibilite: dto.visibilite || 'PRIVE',
        est_strategique: dto.est_strategique || false,
        etablissement_id: etablissementId,
      },
      include: { contacts: true },
    });

    return partenaire as PartenaireResponseDto;
  }

  async findAll(query: QueryPartenaireDto, etablissementId?: string) {
    const { page = 1, limit = 20, nom, type, pays, statut, visibilite } = query;

    const where: any = { archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;
    if (nom) where.nom = { contains: nom, mode: 'insensitive' };
    if (type) where.type = { contains: type, mode: 'insensitive' };
    if (pays) where.pays = { contains: pays, mode: 'insensitive' };
    if (statut) where.statut = statut;
    if (visibilite) where.visibilite = visibilite;

    const [data, total] = await Promise.all([
      this.prisma.partenaire.findMany({
        where,
        include: { contacts: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.partenaire.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, etablissementId?: string) {
    const where: any = { id, archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const partenaire = await this.prisma.partenaire.findUnique({
      where,
      include: { contacts: true },
    });

    if (!partenaire) {
      throw new NotFoundException('Partenaire non trouvé');
    }

    return partenaire;
  }


    async update(id: string, dto: UpdatePartenaireDto, etablissementId?: string) {
    await this.findOne(id, etablissementId);

    // Exclure etablissement_id pour éviter toute tentative de modification
    const { etablissement_id, ...data } = dto;

    if (data.nom) {
        const existant = await this.prisma.partenaire.findFirst({
        where: {
            nom: data.nom,
            etablissement_id: etablissementId,
            id: { not: id },
            archive: false,
        },
        });
        if (existant) {
        throw new ConflictException(`Un partenaire nommé "${data.nom}" existe déjà.`);
        }
    }

  const partenaire = await this.prisma.partenaire.update({
    where: { id },
    data,
    include: { contacts: true },
  });

  return partenaire;
}

  async archiver(id: string, etablissementId?: string) {
    await this.findOne(id, etablissementId);

    // Vérifier que le partenaire n'est pas utilisé dans un projet ou partenariat actif
    const projetsActifs = await this.prisma.projet.count({
      where: {
        partenaires: { some: { partenaire_id: id } },
        archive: false,
        statut: { notIn: ['TERMINE', 'EXPIRE'] },
      },
    });
    const partenariatsActifs = await this.prisma.partenariat.count({
      where: {
        partenaires: { some: { partenaire_id: id } },
        archive: false,
        statut: { notIn: ['TERMINE'] },
      },
    });

    if (projetsActifs > 0 || partenariatsActifs > 0) {
      throw new ConflictException('Impossible d archiver un partenaire associé à un projet ou partenariat actif.');
    }

    return this.prisma.partenaire.update({
      where: { id },
      data: { archive: true },
    });
  }

  async rechercherDoublon(nom: string, etablissementId: string) {
    const existant = await this.prisma.partenaire.findFirst({
      where: {
        nom: { equals: nom, mode: 'insensitive' },
        etablissement_id: etablissementId,
        archive: false,
      },
      include: { contacts: true },
    });
    return existant;
  }
}