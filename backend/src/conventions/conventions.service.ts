import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  DataSource,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import { QueryConventionDto } from './dto/query-convention.dto';
import { ConventionResponseDto } from './dto/convention-response.dto';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { Convention } from './entities/convention.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';

@Injectable()
export class ConventionsService {
  constructor(
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
    @InjectRepository(CotutelleThese)
    private cotutelleRepo: Repository<CotutelleThese>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateConventionDto): Promise<ConventionResponseDto> {
    if (!dto.partenariat_id && !dto.projet_id && !dto.cotutelle_id) {
      throw new BadRequestException(
        'Une convention doit etre associee a un partenariat, un projet ou une cotutelle',
      );
    }

    const convention = await this.dataSource.transaction(async (manager) => {
      const conventionRepo = manager.getRepository(Convention);
      const partenariatRepo = manager.getRepository(Partenariat);
      const projetRepo = manager.getRepository(Projet);
      const cotutelleRepo = manager.getRepository(CotutelleThese);

      if (dto.partenariat_id) {
        const partenariat = await partenariatRepo.findOne({
          where: { id: dto.partenariat_id, archive: false },
        });
        if (!partenariat) {
          throw new NotFoundException('Partenariat non trouve');
        }
      }

      if (dto.projet_id) {
        const projet = await projetRepo.findOne({
          where: { id: dto.projet_id, archive: false },
        });
        if (!projet) throw new NotFoundException('Projet non trouve');
      }

      if (dto.cotutelle_id) {
        const cotutelle = await cotutelleRepo.findOne({
          where: { id: dto.cotutelle_id, archive: false },
        });
        if (!cotutelle) {
          throw new NotFoundException('Cotutelle non trouvee');
        }
      }

      const existante = await conventionRepo.findOne({
        where: { reference: dto.reference },
      });
      if (existante) {
        throw new ConflictException(
          `Une convention avec la reference "${dto.reference}" existe deja`,
        );
      }

      const creee = await conventionRepo.save(
        conventionRepo.create({
          reference: dto.reference,
          titre: dto.titre,
          date_signature: dto.date_signature
            ? new Date(dto.date_signature)
            : null,
          date_debut: dto.date_debut ? new Date(dto.date_debut) : null,
          date_fin: dto.date_fin ? new Date(dto.date_fin) : null,
          statut: dto.statut || StatutConvention.BROUILLON,
          description: dto.description ?? null,
          archive: false,
          partenariat_id: dto.partenariat_id || null,
          projet_id: dto.projet_id || null,
        }),
      );

      if (dto.cotutelle_id) {
        await cotutelleRepo.update(dto.cotutelle_id, {
          convention_id: creee.id,
        });
      }

      return creee;
    });

    return this.mapToResponse(convention);
  }

  async findAll(query: QueryConventionDto) {
    const {
      page = 1,
      limit = 20,
      reference,
      titre,
      statut,
      partenariat_id,
      projet_id,
      date_fin_from,
      date_fin_to,
      archive,
    } = query;

    const where: any = { archive: archive !== undefined ? archive : false };
    if (reference) where.reference = ILike(`%${reference}%`);
    if (titre) where.titre = ILike(`%${titre}%`);
    if (statut) where.statut = statut;
    if (partenariat_id) where.partenariat_id = partenariat_id;
    if (projet_id) where.projet_id = projet_id;
    if (date_fin_from || date_fin_to) {
      if (date_fin_from && date_fin_to) {
        where.date_fin = And(
          MoreThanOrEqual(new Date(date_fin_from)),
          LessThanOrEqual(new Date(date_fin_to)),
        );
      } else if (date_fin_from) {
        where.date_fin = MoreThanOrEqual(new Date(date_fin_from));
      } else if (date_fin_to) {
        where.date_fin = LessThanOrEqual(new Date(date_fin_to));
      }
    }

    const [data, total] = await this.conventionRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: data.map((convention) => this.mapToResponse(convention)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<ConventionResponseDto> {
    const convention = await this.conventionRepo.findOne({
      where: { id, archive: false },
    });
    if (!convention) throw new NotFoundException('Convention non trouvee');
    return this.mapToResponse(convention);
  }

  async update(
    id: string,
    dto: UpdateConventionDto,
  ): Promise<ConventionResponseDto> {
    await this.findOne(id);

    await this.dataSource.transaction(async (manager) => {
      const conventionRepo = manager.getRepository(Convention);
      const partenariatRepo = manager.getRepository(Partenariat);
      const projetRepo = manager.getRepository(Projet);
      const cotutelleRepo = manager.getRepository(CotutelleThese);

      if (dto.reference) {
        const existante = await conventionRepo.findOne({
          where: { reference: dto.reference },
        });
        if (existante && existante.id !== id) {
          throw new ConflictException(
            `Une convention avec la reference "${dto.reference}" existe deja`,
          );
        }
      }

      if (dto.partenariat_id) {
        const partenariat = await partenariatRepo.findOne({
          where: { id: dto.partenariat_id, archive: false },
        });
        if (!partenariat) {
          throw new NotFoundException('Partenariat non trouve');
        }
      }

      if (dto.projet_id) {
        const projet = await projetRepo.findOne({
          where: { id: dto.projet_id, archive: false },
        });
        if (!projet) throw new NotFoundException('Projet non trouve');
      }

      const data: Partial<Convention> = {};
      if (dto.reference) data.reference = dto.reference;
      if (dto.titre) data.titre = dto.titre;
      if (dto.date_signature !== undefined) {
        data.date_signature = dto.date_signature
          ? new Date(dto.date_signature)
          : null;
      }
      if (dto.date_debut !== undefined) {
        data.date_debut = dto.date_debut ? new Date(dto.date_debut) : null;
      }
      if (dto.date_fin !== undefined) {
        data.date_fin = dto.date_fin ? new Date(dto.date_fin) : null;
      }
      if (dto.statut) data.statut = dto.statut;
      if (dto.description !== undefined) data.description = dto.description ?? null;
      if (dto.partenariat_id !== undefined) {
        data.partenariat_id = dto.partenariat_id || null;
      }
      if (dto.projet_id !== undefined) {
        data.projet_id = dto.projet_id || null;
      }

      await conventionRepo.update(id, data);

      if (dto.cotutelle_id !== undefined) {
        await cotutelleRepo.update(
          { convention_id: id },
          { convention_id: null },
        );

        if (dto.cotutelle_id) {
          const cotutelle = await cotutelleRepo.findOne({
            where: { id: dto.cotutelle_id, archive: false },
          });
          if (!cotutelle) {
            throw new NotFoundException('Cotutelle non trouvee');
          }

          await cotutelleRepo.update(dto.cotutelle_id, {
            convention_id: id,
          });
        }
      }
    });

    return this.findOne(id);
  }

  async archiver(id: string): Promise<ConventionResponseDto> {
    await this.findOne(id);
    await this.conventionRepo.update(id, { archive: true });
    const archived = await this.conventionRepo.findOneByOrFail({ id });
    return this.mapToResponse(archived);
  }

  private mapToResponse(data: Convention): ConventionResponseDto {
    return {
      id: data.id,
      reference: data.reference,
      titre: data.titre,
      date_signature: data.date_signature,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      statut: data.statut,
      description: data.description,
      archive: data.archive,
      partenariat_id: data.partenariat_id,
      projet_id: data.projet_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}
