import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { QueryPublicationDto } from './dto/query-publication.dto';
import { PublicationResponseDto } from './dto/publication-response.dto';
import { StatutPublication } from '../common/enums/statut-publication.enum';

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePublicationDto): Promise<PublicationResponseDto> {
    const projet = await this.prisma.projet.findUnique({
      where: { id: dto.projet_id, archive: false },
    });
    if (!projet) throw new NotFoundException('Projet non trouve');

    const existante = await this.prisma.publication.findUnique({
      where: { projet_id: dto.projet_id },
    });
    if (existante) {
      throw new ConflictException('Ce projet possede deja une publication');
    }

    const publication = await this.prisma.publication.create({
      data: {
        titre: dto.titre,
        description_publique: dto.description_publique,
        date_publication: dto.date_publication ? new Date(dto.date_publication) : null,
        statut: dto.statut || StatutPublication.BROUILLON,
        resultats: dto.resultats,
        projet_id: dto.projet_id,
      },
      include: { photos: { orderBy: { ordre: 'asc' } } },
    });

    return this.mapToResponse(publication);
  }

  async findAll(query: QueryPublicationDto) {
    const { page = 1, limit = 20, titre, statut, projet_id } = query;

    const where: any = {};
    if (titre) where.titre = { contains: titre, mode: 'insensitive' };
    if (statut) where.statut = statut;
    if (projet_id) where.projet_id = projet_id;

    const [data, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        include: { photos: { orderBy: { ordre: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return {
      data: data.map((p) => this.mapToResponse(p)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<PublicationResponseDto> {
    const publication = await this.prisma.publication.findUnique({
      where: { id },
      include: { photos: { orderBy: { ordre: 'asc' } } },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');
    return this.mapToResponse(publication);
  }

  async update(id: string, dto: UpdatePublicationDto): Promise<PublicationResponseDto> {
    await this.findOne(id);

    if (dto.projet_id) {
      const projet = await this.prisma.projet.findUnique({
        where: { id: dto.projet_id, archive: false },
      });
      if (!projet) throw new NotFoundException('Projet non trouve');

      const existante = await this.prisma.publication.findUnique({
        where: { projet_id: dto.projet_id },
      });
      if (existante && existante.id !== id) {
        throw new ConflictException('Ce projet possede deja une publication');
      }
    }

    const data: any = {};
    if (dto.titre) data.titre = dto.titre;
    if (dto.description_publique !== undefined) data.description_publique = dto.description_publique;
    if (dto.date_publication !== undefined) {
      data.date_publication = dto.date_publication ? new Date(dto.date_publication) : null;
    }
    if (dto.statut) data.statut = dto.statut;
    if (dto.resultats !== undefined) data.resultats = dto.resultats;
    if (dto.projet_id) data.projet_id = dto.projet_id;

    const updated = await this.prisma.publication.update({
      where: { id },
      data,
      include: { photos: { orderBy: { ordre: 'asc' } } },
    });

    return this.mapToResponse(updated);
  }

  async publier(id: string): Promise<PublicationResponseDto> {
    const publication = await this.findOne(id);

    if (publication.statut === StatutPublication.PUBLIEE) {
      throw new ConflictException('Cette publication est deja publiee');
    }

    const updated = await this.prisma.publication.update({
      where: { id },
      data: {
        statut: StatutPublication.PUBLIEE,
        date_publication: publication.date_publication || new Date(),
      },
      include: { photos: { orderBy: { ordre: 'asc' } } },
    });

    return this.mapToResponse(updated);
  }

  private mapToResponse(data: any): PublicationResponseDto {
    return {
      id: data.id,
      titre: data.titre,
      description_publique: data.description_publique,
      date_publication: data.date_publication,
      statut: data.statut,
      resultats: data.resultats,
      projet_id: data.projet_id,
      photos: data.photos.map((p: any) => ({
        id: p.id,
        url_fichier: p.url_fichier,
        legende: p.legende,
        ordre: p.ordre,
      })),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}