import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Document } from '../documents/entities/document.entity';
import { QueryArchiveDto } from './dto/query-archive.dto';

export const TYPES_ARCHIVE = [
  'partenaires',
  'partenariats',
  'projets',
  'conventions',
  'cotutelles',
  'documents',
] as const;

export type TypeArchive = (typeof TYPES_ARCHIVE)[number];

export function estTypeArchive(valeur: string): valeur is TypeArchive {
  return (TYPES_ARCHIVE as readonly string[]).includes(valeur);
}

@Injectable()
export class ArchivesService {
  constructor(
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @InjectRepository(CotutelleThese)
    private cotutelleRepo: Repository<CotutelleThese>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
  ) {}

  async listerPartenaires(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.partenaireRepo.findAndCount({
      where: {
        archive: true,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listerPartenariats(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: FindOptionsWhere<Partenariat> = {
      archive: true,
      ...(etablissementId
        ? { etablissements: { etablissement_id: etablissementId } }
        : {}),
    };
    const [data, total] = await this.partenariatRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
      relations: {
        etablissements: { etablissement: true },
        partenaires: { partenaire: true },
      },
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listerProjets(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.projetRepo.findAndCount({
      where: {
        archive: true,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listerConventions(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: FindOptionsWhere<Convention> = {
      archive: true,
      ...(etablissementId
        ? { projet: { etablissement_id: etablissementId } }
        : {}),
    };
    const [data, total] = await this.conventionRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listerCotutelles(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.cotutelleRepo.findAndCount({
      where: {
        archive: true,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // La table Document n'a pas d'etablissement_id : tous les utilisateurs
  // autorises voient l'ensemble des documents archives.
  async listerDocuments(query: QueryArchiveDto) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.documentRepo.findAndCount({
      where: { est_archive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async detailArchive(type: TypeArchive, id: string, etablissementId?: string) {
    switch (type) {
      case 'partenaires': {
        const where: FindOptionsWhere<Partenaire> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.partenaireRepo.findOne({
          where,
          relations: { contacts: true, etablissement: true },
        });
        if (!entite) throw new NotFoundException('Partenaire archive non trouve');
        return entite;
      }
      case 'partenariats': {
        const where: FindOptionsWhere<Partenariat> = { id, archive: true };
        if (etablissementId) {
          where.etablissements = { etablissement_id: etablissementId };
        }
        const entite = await this.partenariatRepo.findOne({
          where,
          relations: {
            etablissements: { etablissement: true },
            partenaires: { partenaire: true },
            projets: true,
            conventions: true,
          },
        });
        if (!entite) throw new NotFoundException('Partenariat archive non trouve');
        return entite;
      }
      case 'projets': {
        const where: FindOptionsWhere<Projet> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.projetRepo.findOne({
          where,
          relations: {
            etablissement: true,
            partenariat: true,
            porteur: true,
            activites: true,
            partenaires: { partenaire: true },
            beneficiaires: { beneficiaire: true },
            bailleurs: { bailleur: true },
            sites: { site: true },
            documents: true,
          },
        });
        if (!entite) throw new NotFoundException('Projet archive non trouve');
        return entite;
      }
      case 'conventions': {
        const where: FindOptionsWhere<Convention> = { id, archive: true };
        if (etablissementId) {
          where.projet = { etablissement_id: etablissementId };
        }
        const entite = await this.conventionRepo.findOne({
          where,
          relations: { projet: true, partenariat: true, documents: true },
        });
        if (!entite) throw new NotFoundException('Convention archivee non trouvee');
        return entite;
      }
      case 'cotutelles': {
        const where: FindOptionsWhere<CotutelleThese> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.cotutelleRepo.findOne({
          where,
          relations: { etablissement: true, partenaire: true, convention: true },
        });
        if (!entite) throw new NotFoundException('Cotutelle archivee non trouvee');
        return entite;
      }
      case 'documents': {
        const entite = await this.documentRepo.findOne({
          where: { id, est_archive: true },
        });
        if (!entite) throw new NotFoundException('Document archive non trouve');
        return entite;
      }
      default:
        throw new BadRequestException('Type d archive invalide');
    }
  }

  async restaurer(type: TypeArchive, id: string, etablissementId?: string) {
    switch (type) {
      case 'partenaires': {
        const where: FindOptionsWhere<Partenaire> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.partenaireRepo.findOne({ where });
        if (!entite) throw new NotFoundException('Partenaire archive non trouve');
        await this.partenaireRepo.update(id, { archive: false });
        return { message: 'Partenaire restaure' };
      }
      case 'partenariats': {
        const where: FindOptionsWhere<Partenariat> = { id, archive: true };
        if (etablissementId) {
          where.etablissements = { etablissement_id: etablissementId };
        }
        const entite = await this.partenariatRepo.findOne({ where });
        if (!entite) throw new NotFoundException('Partenariat archive non trouve');
        await this.partenariatRepo.update(id, { archive: false });
        return { message: 'Partenariat restaure' };
      }
      case 'projets': {
        const where: FindOptionsWhere<Projet> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.projetRepo.findOne({ where });
        if (!entite) throw new NotFoundException('Projet archive non trouve');
        await this.projetRepo.update(id, { archive: false });
        return { message: 'Projet restaure' };
      }
      case 'conventions': {
        const where: FindOptionsWhere<Convention> = { id, archive: true };
        if (etablissementId) {
          where.projet = { etablissement_id: etablissementId };
        }
        const entite = await this.conventionRepo.findOne({ where });
        if (!entite) throw new NotFoundException('Convention archivee non trouvee');
        await this.conventionRepo.update(id, { archive: false });
        return { message: 'Convention restauree' };
      }
      case 'cotutelles': {
        const where: FindOptionsWhere<CotutelleThese> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.cotutelleRepo.findOne({ where });
        if (!entite) throw new NotFoundException('Cotutelle archivee non trouvee');
        await this.cotutelleRepo.update(id, { archive: false });
        return { message: 'Cotutelle restauree' };
      }
      case 'documents': {
        const entite = await this.documentRepo.findOne({
          where: { id, est_archive: true },
        });
        if (!entite) throw new NotFoundException('Document archive non trouve');
        await this.documentRepo.update(id, { est_archive: false });
        return { message: 'Document restaure' };
      }
      default:
        throw new BadRequestException('Type d archive invalide');
    }
  }
}