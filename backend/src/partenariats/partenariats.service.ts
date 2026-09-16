import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartenariatDto } from './dto/create-partenariat.dto';
import { UpdatePartenariatDto } from './dto/update-partenariat.dto';
import { QueryPartenariatDto } from './dto/query-partenariat.dto';
import { PartenariatResponseDto } from './dto/partenariat-response.dto';
import { StatutPartenariat } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { Role } from '../common/enums/role.enum'

@Injectable()
export class PartenariatsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(etablissementId: string, dto: CreatePartenariatDto): Promise<PartenariatResponseDto> {
    // Vérifier que l'établissement existe
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: etablissementId },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement non trouvé');
    }

    // Vérifier que tous les établissements associés existent (RG17)
    for (const etabId of dto.etablissements_ids) {
      const etab = await this.prisma.etablissement.findUnique({
        where: { id: etabId },
      });
      if (!etab) {
        throw new NotFoundException(`Établissement ${etabId} non trouvé`);
      }
    }

    // Vérifier que tous les partenaires associés existent
    for (const partId of dto.partenaires_ids) {
      const part = await this.prisma.partenaire.findUnique({
        where: { id: partId },
      });
      if (!part) {
        throw new NotFoundException(`Partenaire ${partId} non trouvé`);
      }
    }

    // Créer le partenariat (RG06 : rattachement automatique à l'établissement connecté)
    const partenariat = await this.prisma.partenariat.create({
      data: {
        intitule: dto.intitule,
        objet: dto.objet,
        domaine: dto.domaine,
        date_debut: new Date(dto.date_debut),
        date_fin: dto.date_fin ? new Date(dto.date_fin) : undefined,
        statut: dto.statut || StatutPartenariat.BROUILLON,
        actions_realisees: dto.actions_realisees,
        actions_en_cours: dto.actions_en_cours,
        actions_prevues: dto.actions_prevues,
        resultats_obtenus: dto.resultats_obtenus,
        difficultes_contraintes: dto.difficultes_contraintes,
        perspectives_recommandations: dto.perspectives_recommandations,
        etablissements: {
          create: dto.etablissements_ids.map((id) => ({
            etablissement_id: id,
          })),
        },
        partenaires: {
          create: dto.partenaires_ids.map((id) => ({
            partenaire_id: id,
          })),
        },
      },
      include: {
        etablissements: {
          include: { etablissement: true },
        },
        partenaires: {
          include: { partenaire: true },
        },
      },
    });

    return this.mapToResponse(partenariat);
  }

  async findAll(query: QueryPartenariatDto, etablissementId?: string) {
    const { page = 1, limit = 20, intitule, domaine, statut, archive } = query;

    const where: any = { archive: false };

      // Si archive est fourni, on l'utilise, sinon on prend false (par défaut)
    if (archive !== undefined) {
        where.archive = archive;
    } else {
        where.archive = false;
    }

    if (etablissementId) {
      where.etablissements = { some: { etablissement_id: etablissementId } };
    }
    if (intitule) where.intitule = { contains: intitule, mode: 'insensitive' };
    if (domaine) where.domaine = domaine;
    if (statut) where.statut = statut;

    const [data, total] = await Promise.all([
      this.prisma.partenariat.findMany({
        where,
        include: {
          etablissements: {
            include: { etablissement: true },
          },
          partenaires: {
            include: { partenaire: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.partenariat.count({ where }),
    ]);

    return {
      data: data.map((p) => this.mapToResponse(p)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, etablissementId?: string, includeArchived = false) {
    const where: any = { id };
    if (!includeArchived) {
        where.archive = false;
    }
    if (etablissementId) {
      where.etablissements = { some: { etablissement_id: etablissementId } };
    }

    const partenariat = await this.prisma.partenariat.findUnique({
      where,
      include: {
        etablissements: {
          include: { etablissement: true },
        },
        partenaires: {
          include: { partenaire: true },
        },
      },
    });

    if (!partenariat) {
      throw new NotFoundException('Partenariat non trouvé');
    }

    return this.mapToResponse(partenariat);
  }

  async update(id: string, dto: UpdatePartenariatDto, etablissementId?: string, userRole?: Role) {
    const existing = await this.findOne(id, etablissementId);

    // Un établissement ne peut modifier qu'un partenariat en BROUILLON
    if (userRole !== Role.PRESIDENCE && existing.statut !== StatutPartenariat.BROUILLON) {
      throw new ForbiddenException('Ce partenariat n\'est plus modifiable (statut différent de BROUILLON)');
    }

    // Construction du payload de mise à jour
    const updateData: any = {};
    if (dto.intitule) updateData.intitule = dto.intitule;
    if (dto.objet !== undefined) updateData.objet = dto.objet;
    if (dto.domaine) updateData.domaine = dto.domaine;
    if (dto.date_debut) updateData.date_debut = new Date(dto.date_debut);
    if (dto.date_fin !== undefined) updateData.date_fin = dto.date_fin ? new Date(dto.date_fin) : null;
    if (dto.statut) updateData.statut = dto.statut;
    if (dto.actions_realisees !== undefined) updateData.actions_realisees = dto.actions_realisees;
    if (dto.actions_en_cours !== undefined) updateData.actions_en_cours = dto.actions_en_cours;
    if (dto.actions_prevues !== undefined) updateData.actions_prevues = dto.actions_prevues;
    if (dto.resultats_obtenus !== undefined) updateData.resultats_obtenus = dto.resultats_obtenus;
    if (dto.difficultes_contraintes !== undefined) updateData.difficultes_contraintes = dto.difficultes_contraintes;
    if (dto.perspectives_recommandations !== undefined) updateData.perspectives_recommandations = dto.perspectives_recommandations;

    const updated = await this.prisma.partenariat.update({
      where: { id },
      data: updateData,
      include: {
        etablissements: {
          include: { etablissement: true },
        },
        partenaires: {
          include: { partenaire: true },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async soumettre(id: string, etablissementId?: string) {
    const partenariat = await this.findOne(id, etablissementId);

    if (partenariat.statut !== StatutPartenariat.BROUILLON) {
      throw new ConflictException('Seul un partenariat en BROUILLON peut être soumis');
    }

    const updated = await this.prisma.partenariat.update({
      where: { id },
      data: { statut: StatutPartenariat.EN_ATTENTE },
      include: {
        etablissements: {
          include: { etablissement: true },
        },
        partenaires: {
          include: { partenaire: true },
        },
      },
    });

    // Notification : soumission du partenariat
    this.eventEmitter.emit('partenariat.soumis', {
      type: TypeNotification.PARTENARIAT_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Partenariat soumis : ${partenariat.intitule}`,
      message: `Le partenariat "${partenariat.intitule}" a été soumis par l'établissement.`,
      utilisateur_id: null, // Envoyer à la Présidence
      reference_type: 'Partenariat',
      reference_id: id,
    });

    return this.mapToResponse(updated);
  }

async archiver(id: string) {
  const partenariat = await this.prisma.partenariat.findUnique({
    where: { id, archive: false },
    include: {
      etablissements: { include: { etablissement: true } },
      partenaires: { include: { partenaire: true } },
    },
  });
  if (!partenariat) throw new NotFoundException('Partenariat non trouvé');

  const projetsActifs = await this.prisma.projet.count({
    where: {
      partenariat_id: id,
      archive: false,
      statut: { notIn: ['TERMINE', 'EXPIRE'] },
    },
  });

  if (projetsActifs > 0) {
    throw new ConflictException(
      'Impossible d\'archiver un partenariat avec des projets actifs',
    );
  }

  const archived = await this.prisma.partenariat.update({
    where: { id },
    data: { archive: true },
    include: {
      etablissements: { include: { etablissement: true } },
      partenaires: { include: { partenaire: true } },
    },
  });

  return this.mapToResponse(archived);
}

  private mapToResponse(data: any): PartenariatResponseDto {
    return {
      id: data.id,
      intitule: data.intitule,
      objet: data.objet,
      domaine: data.domaine,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      statut: data.statut,
      actions_realisees: data.actions_realisees,
      actions_en_cours: data.actions_en_cours,
      actions_prevues: data.actions_prevues,
      resultats_obtenus: data.resultats_obtenus,
      difficultes_contraintes: data.difficultes_contraintes,
      perspectives_recommandations: data.perspectives_recommandations,
      archive: data.archive,
      created_at: data.created_at,
      updated_at: data.updated_at,
      etablissements: data.etablissements.map((e: any) => ({
        id: e.etablissement.id,
        nom: e.etablissement.nom,
        sigle: e.etablissement.sigle,
      })),
      partenaires: data.partenaires.map((p: any) => ({
        id: p.partenaire.id,
        nom: p.partenaire.nom,
      })),
    };
  }
}