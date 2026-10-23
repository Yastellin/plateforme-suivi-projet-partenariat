import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { QueryPublicationDto } from './dto/query-publication.dto';
import { PublicationResponseDto } from './dto/publication-response.dto';
import { StatutPublication } from '../common/enums/statut-publication.enum';
import { Publication } from './enitities/publication.entity';
import { PhotoPublication } from './enitities/photo-publication.entity';
import { Projet } from '../projets/entities/projet.entity';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepo: Repository<Publication>,
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
  ) {}

  async create(dto: CreatePublicationDto): Promise<PublicationResponseDto> {
    const projet = await this.projetRepo.findOne({
      where: { id: dto.projet_id, archive: false },
    });
    if (!projet) throw new NotFoundException('Projet non trouve');

    const existante = await this.publicationRepo.findOne({
      where: { projet_id: dto.projet_id },
    });
    if (existante) {
      throw new ConflictException('Ce projet possede deja une publication');
    }

    const statut = dto.statut ?? StatutPublication.BROUILLON;
    if (statut === StatutPublication.PUBLIEE) {
      this.verifierProjetPublie(projet);
    }

    const publication = await this.publicationRepo.save(
      this.publicationRepo.create({
        titre: dto.titre,
        description_publique: dto.description_publique ?? null,
        date_publication: dto.date_publication
          ? new Date(dto.date_publication)
          : statut === StatutPublication.PUBLIEE
            ? new Date()
            : null,
        statut,
        resultats: dto.resultats ?? null,
        projet_id: dto.projet_id,
      }),
    );

    return this.findOne(publication.id);
  }

  async findAll(query: QueryPublicationDto) {
    const { page = 1, limit = 20, titre, statut, projet_id } = query;

    const where: any = {};
    if (titre) where.titre = ILike(`%${titre}%`);
    if (statut) where.statut = statut;
    if (projet_id) where.projet_id = projet_id;

    const [data, total] = await this.publicationRepo.findAndCount({
      where,
      relations: { photos: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC', photos: { ordre: 'ASC' } },
    });

    return {
      data: data.map((publication) => this.mapToResponse(publication)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<PublicationResponseDto> {
    const publication = await this.publicationRepo.findOne({
      where: { id },
      relations: { photos: true },
      order: { photos: { ordre: 'ASC' } },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');
    return this.mapToResponse(publication);
  }

  async update(
    id: string,
    dto: UpdatePublicationDto,
  ): Promise<PublicationResponseDto> {
    const publication = await this.findOne(id);
    let projetCible: Projet | null = null;

    if (dto.projet_id) {
      projetCible = await this.projetRepo.findOne({
        where: { id: dto.projet_id, archive: false },
      });
      if (!projetCible) throw new NotFoundException('Projet non trouve');

      const existante = await this.publicationRepo.findOne({
        where: { projet_id: dto.projet_id },
      });
      if (existante && existante.id !== id) {
        throw new ConflictException('Ce projet possede deja une publication');
      }
    }

    const statutFinal = dto.statut ?? publication.statut;
    if (statutFinal === StatutPublication.PUBLIEE) {
      projetCible ??= await this.projetRepo.findOne({
        where: { id: dto.projet_id ?? publication.projet_id, archive: false },
      });
      if (!projetCible) throw new NotFoundException('Projet non trouve');
      this.verifierProjetPublie(projetCible);
    }

    const data: Partial<Publication> = {};
    if (dto.titre) data.titre = dto.titre;
    if (dto.description_publique !== undefined) {
      data.description_publique = dto.description_publique ?? null;
    }
    if (dto.date_publication !== undefined) {
      data.date_publication = dto.date_publication
        ? new Date(dto.date_publication)
        : statutFinal === StatutPublication.PUBLIEE
          ? publication.date_publication || new Date()
          : null;
    } else if (
      dto.statut === StatutPublication.PUBLIEE &&
      !publication.date_publication
    ) {
      data.date_publication = new Date();
    }
    if (dto.statut) data.statut = dto.statut;
    if (dto.resultats !== undefined) data.resultats = dto.resultats ?? null;
    if (dto.projet_id) data.projet_id = dto.projet_id;

    await this.publicationRepo.update(id, data);
    return this.findOne(id);
  }

  async publier(id: string): Promise<PublicationResponseDto> {
    const publication = await this.findOne(id);

    if (publication.statut === StatutPublication.PUBLIEE) {
      throw new ConflictException('Cette publication est deja publiee');
    }

    const projet = await this.projetRepo.findOne({
      where: { id: publication.projet_id, archive: false },
    });
    if (!projet) throw new NotFoundException('Projet non trouve');
    this.verifierProjetPublie(projet);

    await this.publicationRepo.update(id, {
      statut: StatutPublication.PUBLIEE,
      date_publication: publication.date_publication || new Date(),
    });

    return this.findOne(id);
  }

  private verifierProjetPublie(projet: Projet): void {
    if (!projet.publie_le) {
      throw new ConflictException(
        'Publiez d’abord le projet avant de publier son contenu éditorial',
      );
    }
  }

  private mapToResponse(data: Publication): PublicationResponseDto {
    return {
      id: data.id,
      titre: data.titre,
      description_publique: data.description_publique,
      date_publication: data.date_publication,
      statut: data.statut,
      resultats: data.resultats,
      projet_id: data.projet_id,
      photos: (data.photos ?? []).map((p: PhotoPublication) => ({
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
