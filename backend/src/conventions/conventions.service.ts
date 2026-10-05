import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import { QueryConventionDto } from './dto/query-convention.dto';
import { ConventionResponseDto } from './dto/convention-response.dto';
import { StatutConvention } from '../common/enums/statut-convention.enum';

@Injectable()
export class ConventionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConventionDto): Promise<ConventionResponseDto> {
    // Verifier au moins une association
    if (!dto.partenariat_id && !dto.projet_id && !dto.cotutelle_id) {
      throw new BadRequestException(
        'Une convention doit etre associee a un partenariat, un projet ou une cotutelle',
      );
    }

    // Transaction : creation convention + association cotutelle.
    // Sans transaction, une erreur sur l'association laisserait la convention
    // creee sans son lien de cotutelle.
    const convention = await this.prisma.$transaction(async (tx) => {
      if (dto.partenariat_id) {
        const partenariat = await tx.partenariat.findUnique({
          where: { id: dto.partenariat_id, archive: false },
        });
        if (!partenariat) throw new NotFoundException('Partenariat non trouve');
      }

      if (dto.projet_id) {
        const projet = await tx.projet.findUnique({
          where: { id: dto.projet_id, archive: false },
        });
        if (!projet) throw new NotFoundException('Projet non trouve');
      }

      if (dto.cotutelle_id) {
        const cotutelle = await tx.cotutelleThese.findUnique({
          where: { id: dto.cotutelle_id, archive: false },
        });
        if (!cotutelle) throw new NotFoundException('Cotutelle non trouvee');
      }

      const existante = await tx.convention.findUnique({
        where: { reference: dto.reference },
      });
      if (existante) {
        throw new ConflictException(
          `Une convention avec la reference "${dto.reference}" existe deja`,
        );
      }

      const creee = await tx.convention.create({
        data: {
          reference: dto.reference,
          titre: dto.titre,
          date_signature: dto.date_signature ? new Date(dto.date_signature) : null,
          date_debut: dto.date_debut ? new Date(dto.date_debut) : null,
          date_fin: dto.date_fin ? new Date(dto.date_fin) : null,
          statut: dto.statut || StatutConvention.BROUILLON,
          description: dto.description,
          partenariat_id: dto.partenariat_id || null,
          projet_id: dto.projet_id || null,
        },
      });

      // Association optionnelle a une cotutelle (relation portee par CotutelleThese.convention_id)
      if (dto.cotutelle_id) {
        await tx.cotutelleThese.update({
          where: { id: dto.cotutelle_id },
          data: { convention_id: creee.id },
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
      archive,
    } = query;

    const where: any = { archive: archive !== undefined ? archive : false };
    if (reference) where.reference = { contains: reference, mode: 'insensitive' };
    if (titre) where.titre = { contains: titre, mode: 'insensitive' };
    if (statut) where.statut = statut;
    if (partenariat_id) where.partenariat_id = partenariat_id;
    if (projet_id) where.projet_id = projet_id;

    const [data, total] = await Promise.all([
      this.prisma.convention.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.convention.count({ where }),
    ]);

    return {
      data: data.map((c) => this.mapToResponse(c)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<ConventionResponseDto> {
    const convention = await this.prisma.convention.findFirst({
      where: { id, archive: false },   // findFirst
    });
    if (!convention) throw new NotFoundException('Convention non trouvee');
    return this.mapToResponse(convention);
  }

  async update(id: string, dto: UpdateConventionDto): Promise<ConventionResponseDto> {
    await this.findOne(id);

    // Transaction : mise a jour convention + re-association cotutelle.
    // Sans transaction, un echec sur la re-association laisserait la convention
    // modifiee mais sans lien de cotutelle.
    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.reference) {
        const existante = await tx.convention.findUnique({
          where: { reference: dto.reference },
        });
        if (existante && existante.id !== id) {
          throw new ConflictException(
            `Une convention avec la reference "${dto.reference}" existe deja`,
          );
        }
      }

      if (dto.partenariat_id) {
        const partenariat = await tx.partenariat.findUnique({
          where: { id: dto.partenariat_id, archive: false },
        });
        if (!partenariat) throw new NotFoundException('Partenariat non trouve');
      }

      if (dto.projet_id) {
        const projet = await tx.projet.findUnique({
          where: { id: dto.projet_id, archive: false },
        });
        if (!projet) throw new NotFoundException('Projet non trouve');
      }

      const data: any = {};
      if (dto.reference) data.reference = dto.reference;
      if (dto.titre) data.titre = dto.titre;
      if (dto.date_signature !== undefined) {
        data.date_signature = dto.date_signature ? new Date(dto.date_signature) : null;
      }
      if (dto.date_debut !== undefined) {
        data.date_debut = dto.date_debut ? new Date(dto.date_debut) : null;
      }
      if (dto.date_fin !== undefined) {
        data.date_fin = dto.date_fin ? new Date(dto.date_fin) : null;
      }
      if (dto.statut) data.statut = dto.statut;
      if (dto.description !== undefined) data.description = dto.description;
      if (dto.partenariat_id !== undefined) data.partenariat_id = dto.partenariat_id || null;
      if (dto.projet_id !== undefined) data.projet_id = dto.projet_id || null;

      const maj = await tx.convention.update({
        where: { id },
        data,
      });

      // Gerer l'association cotutelle
      if (dto.cotutelle_id !== undefined) {
        // Retirer l'ancienne association
        await tx.cotutelleThese.updateMany({
          where: { convention_id: id },
          data: { convention_id: null },
        });

        // Ajouter la nouvelle
        if (dto.cotutelle_id) {
          const cotutelle = await tx.cotutelleThese.findUnique({
            where: { id: dto.cotutelle_id, archive: false },
          });
          if (!cotutelle) throw new NotFoundException('Cotutelle non trouvee');

          await tx.cotutelleThese.update({
            where: { id: dto.cotutelle_id },
            data: { convention_id: id },
          });
        }
      }

      return maj;
    });

    return this.mapToResponse(updated);
  }

  async archiver(id: string): Promise<ConventionResponseDto> {
    await this.findOne(id);

    const archived = await this.prisma.convention.update({
      where: { id },
      data: { archive: true },
    });

    return this.mapToResponse(archived);
  }

  private mapToResponse(data: any): ConventionResponseDto {
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