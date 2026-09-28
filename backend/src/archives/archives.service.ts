import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryArchiveDto } from './dto/query-archive.dto';

@Injectable()
export class ArchivesService {
  constructor(private prisma: PrismaService) {}

  async listerPartenaires(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: any = { archive: true };
    if (etablissementId) where.etablissement_id = etablissementId;

    const [data, total] = await Promise.all([
      this.prisma.partenaire.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.partenaire.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerPartenariats(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: any = { archive: true };
    if (etablissementId) {
      where.etablissements = { some: { etablissement_id: etablissementId } };
    }

    const [data, total] = await Promise.all([
      this.prisma.partenariat.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
        include: {
          etablissements: { include: { etablissement: true } },
          partenaires: { include: { partenaire: true } },
        },
      }),
      this.prisma.partenariat.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerProjets(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: any = { archive: true };
    if (etablissementId) where.etablissement_id = etablissementId;

    const [data, total] = await Promise.all([
      this.prisma.projet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.projet.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerConventions(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: any = { archive: true };
    if (etablissementId) {
      where.projet = { etablissement_id: etablissementId };
    }

    const [data, total] = await Promise.all([
      this.prisma.convention.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.convention.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listerCotutelles(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: any = { archive: true };
    if (etablissementId) where.etablissement_id = etablissementId;

    const [data, total] = await Promise.all([
      this.prisma.cotutelleThese.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.cotutelleThese.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}