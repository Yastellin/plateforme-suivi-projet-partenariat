import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Document } from '../documents/entities/document.entity';
import { QueryArchiveDto } from './dto/query-archive.dto';
import { HistoriqueService } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';

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
    private historique: HistoriqueService,
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
    const [data, total] = await this.conventionRepo.findAndCount({
      where: this.conditionsConvention(true, etablissementId),
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

  async listerDocuments(query: QueryArchiveDto, etablissementId?: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.documentRepo.findAndCount({
      where: this.conditionsDocument(true, etablissementId),
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
        if (!entite)
          throw new NotFoundException('Partenaire archive non trouve');
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
        if (!entite)
          throw new NotFoundException('Partenariat archive non trouve');
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
        const entite = await this.conventionRepo.findOne({
          where: this.conditionsConvention(true, etablissementId, id),
          relations: {
            projet: true,
            partenariat: true,
            cotutelles: true,
            documents: true,
          },
        });
        if (!entite)
          throw new NotFoundException('Convention archivee non trouvee');
        return entite;
      }
      case 'cotutelles': {
        const where: FindOptionsWhere<CotutelleThese> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.cotutelleRepo.findOne({
          where,
          relations: {
            etablissement: true,
            partenaire: true,
            convention: true,
          },
        });
        if (!entite)
          throw new NotFoundException('Cotutelle archivee non trouvee');
        return entite;
      }
      case 'documents': {
        const entite = await this.documentRepo.findOne({
          where: this.conditionsDocument(true, etablissementId, id),
        });
        if (!entite) throw new NotFoundException('Document archive non trouve');
        return entite;
      }
      default:
        throw new BadRequestException('Type d archive invalide');
    }
  }

  async restaurer(
    type: TypeArchive,
    id: string,
    etablissementId?: string,
    utilisateur?: { id: string; email: string; role: string },
  ) {
    switch (type) {
      case 'partenaires': {
        const where: FindOptionsWhere<Partenaire> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.partenaireRepo.findOne({ where });
        if (!entite)
          throw new NotFoundException('Partenaire archive non trouve');
        const doublonActif = await this.partenaireRepo
          .createQueryBuilder('partenaire')
          .where('partenaire.id <> :id', { id })
          .andWhere('partenaire.archive = false')
          .andWhere('partenaire.etablissement_id = :etablissementId', {
            etablissementId: entite.etablissement_id,
          })
          .andWhere('LOWER(TRIM(partenaire.nom)) = LOWER(TRIM(:nom))', {
            nom: entite.nom,
          })
          .andWhere('LOWER(TRIM(partenaire.pays)) = LOWER(TRIM(:pays))', {
            pays: entite.pays,
          })
          .getExists();
        if (doublonActif) {
          throw new ConflictException(
            'Un partenaire actif de même nom, pays et établissement existe déjà.',
          );
        }
        await this.partenaireRepo.update(id, { archive: false });
        await this.historique.enregistrer({
          action: ActionHistorique.RESTAURATION,
          entite_type: 'Partenaire',
          entite_id: id,
          utilisateur,
        });
        return { message: 'Partenaire restaure' };
      }
      case 'partenariats': {
        const where: FindOptionsWhere<Partenariat> = { id, archive: true };
        if (etablissementId) {
          where.etablissements = { etablissement_id: etablissementId };
        }
        const entite = await this.partenariatRepo.findOne({ where });
        if (!entite)
          throw new NotFoundException('Partenariat archive non trouve');
        await this.partenariatRepo.update(id, { archive: false });
        await this.historique.enregistrer({
          action: ActionHistorique.RESTAURATION,
          entite_type: 'Partenariat',
          entite_id: id,
          utilisateur,
        });
        return { message: 'Partenariat restaure' };
      }
      case 'projets': {
        const where: FindOptionsWhere<Projet> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.projetRepo.findOne({ where });
        if (!entite) throw new NotFoundException('Projet archive non trouve');
        await this.projetRepo.update(id, { archive: false });
        await this.historique.enregistrer({
          action: ActionHistorique.RESTAURATION,
          entite_type: 'Projet',
          entite_id: id,
          utilisateur,
        });
        return { message: 'Projet restaure' };
      }
      case 'conventions': {
        const entite = await this.conventionRepo.findOne({
          where: this.conditionsConvention(true, etablissementId, id),
        });
        if (!entite)
          throw new NotFoundException('Convention archivee non trouvee');
        await this.conventionRepo.update(id, { archive: false });
        await this.historique.enregistrer({
          action: ActionHistorique.RESTAURATION,
          entite_type: 'Convention',
          entite_id: id,
          utilisateur,
        });
        return { message: 'Convention restauree' };
      }
      case 'cotutelles': {
        const where: FindOptionsWhere<CotutelleThese> = { id, archive: true };
        if (etablissementId) where.etablissement_id = etablissementId;
        const entite = await this.cotutelleRepo.findOne({ where });
        if (!entite)
          throw new NotFoundException('Cotutelle archivee non trouvee');
        await this.cotutelleRepo.update(id, { archive: false });
        await this.historique.enregistrer({
          action: ActionHistorique.RESTAURATION,
          entite_type: 'CotutelleThese',
          entite_id: id,
          utilisateur,
        });
        return { message: 'Cotutelle restauree' };
      }
      case 'documents': {
        const entite = await this.documentRepo.findOne({
          where: this.conditionsDocument(true, etablissementId, id),
        });
        if (!entite) throw new NotFoundException('Document archive non trouve');

        // Une seule version reste active pour un même type et un même parent.
        const versionActive = await this.documentRepo.findOne({
          where: {
            type: entite.type,
            est_archive: false,
            projet_id: entite.projet_id ?? IsNull(),
            convention_id: entite.convention_id ?? IsNull(),
            cotutelle_id: entite.cotutelle_id ?? IsNull(),
            partenariat_id: entite.partenariat_id ?? IsNull(),
          },
        });
        if (versionActive && versionActive.id !== entite.id) {
          await this.documentRepo.update(versionActive.id, {
            est_archive: true,
          });
          await this.historique.enregistrer({
            action: ActionHistorique.ARCHIVAGE,
            entite_type: 'Document',
            entite_id: versionActive.id,
            entite_nom: versionActive.nom_fichier,
            utilisateur,
            details: `Remplacé par la restauration de la version ${entite.version}`,
          });
        }

        await this.documentRepo.update(id, { est_archive: false });
        await this.historique.enregistrer({
          action: ActionHistorique.RESTAURATION,
          entite_type: 'Document',
          entite_id: id,
          entite_nom: entite.nom_fichier,
          utilisateur,
          details: `Version ${entite.version}`,
        });
        return { message: 'Document restaure' };
      }
      default:
        throw new BadRequestException('Type d archive invalide');
    }
  }

  private conditionsConvention(
    archive: boolean,
    etablissementId?: string,
    id?: string,
  ): FindOptionsWhere<Convention> | FindOptionsWhere<Convention>[] {
    const commun = { ...(id ? { id } : {}), archive };
    if (!etablissementId) return commun;
    return [
      { ...commun, projet: { etablissement_id: etablissementId } },
      {
        ...commun,
        partenariat: {
          etablissements: { etablissement_id: etablissementId },
        },
      },
      { ...commun, cotutelles: { etablissement_id: etablissementId } },
    ];
  }

  /**
   * Un document appartient à l'établissement de son unique parent. Une
   * convention peut elle-même être rattachée à un projet, un partenariat ou
   * une cotutelle : ces trois chemins sont donc pris en compte.
   */
  private conditionsDocument(
    estArchive: boolean,
    etablissementId?: string,
    id?: string,
  ): FindOptionsWhere<Document> | FindOptionsWhere<Document>[] {
    const commun = { ...(id ? { id } : {}), est_archive: estArchive };
    if (!etablissementId) return commun;

    return [
      { ...commun, projet: { etablissement_id: etablissementId } },
      { ...commun, cotutelle: { etablissement_id: etablissementId } },
      {
        ...commun,
        partenariat: {
          etablissements: { etablissement_id: etablissementId },
        },
      },
      {
        ...commun,
        convention: { projet: { etablissement_id: etablissementId } },
      },
      {
        ...commun,
        convention: {
          partenariat: {
            etablissements: { etablissement_id: etablissementId },
          },
        },
      },
      {
        ...commun,
        convention: { cotutelles: { etablissement_id: etablissementId } },
      },
    ];
  }
}
