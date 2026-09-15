import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { QueryProjetDto } from './dto/query-projet.dto';
import { ProjetResponseDto } from './dto/projet-response.dto';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProjetsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(etablissementId: string, dto: CreateProjetDto): Promise<ProjetResponseDto> {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: etablissementId },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement non trouvé');
    }

    if (dto.partenariat_id) {
      const partenariat = await this.prisma.partenariat.findUnique({
        where: { id: dto.partenariat_id, archive: false },
      });
      if (!partenariat) {
        throw new NotFoundException('Partenariat non trouvé');
      }
    }

    const projet = await this.prisma.projet.create({
      data: {
        nom: dto.nom,
        intitule_officiel: dto.intitule_officiel,
        type: dto.type,
        domaine: dto.domaine,
        budget: dto.budget,
        date_debut: new Date(dto.date_debut),
        date_fin_prevue: new Date(dto.date_fin_prevue),
        statut: dto.statut || StatutProjet.BROUILLON,
        etablissement_id: etablissementId,
        partenariat_id: dto.partenariat_id,
        porteur_id: dto.porteur_id,
        partenaires: dto.partenaires_ids
          ? { create: dto.partenaires_ids.map((id) => ({ partenaire_id: id })) }
          : undefined,
        beneficiaires: dto.beneficiaires_ids
          ? { create: dto.beneficiaires_ids.map((id) => ({ beneficiaire_id: id })) }
          : undefined,
        bailleurs: dto.bailleurs_ids
          ? { create: dto.bailleurs_ids.map((id) => ({ bailleur_id: id })) }
          : undefined,
        sites: dto.sites_ids
          ? { create: dto.sites_ids.map((id) => ({ site_id: id })) }
          : undefined,
      },
    });

    this.eventEmitter.emit('projet.ajoute', {
      type: TypeNotification.PROJET_SOUMIS,
      priorite: PrioriteNotification.MOYENNE,
      titre: `Nouveau projet : ${dto.nom}`,
      message: `L'établissement ${etablissement.nom} a ajouté un nouveau projet : ${dto.nom}`,
      reference_type: 'Projet',
      reference_id: projet.id,
      etablissement_id: etablissementId,
    });

    return this.findOne(projet.id, etablissementId);
  }

  async findAll(query: QueryProjetDto, etablissementId?: string) {
    const { page = 1, limit = 20, nom, type, statut, partenariat_id, partenaire_id, archive } = query;

    const where: any = { archive: archive !== undefined ? archive : false };
    if (etablissementId) where.etablissement_id = etablissementId;
    if (nom) where.nom = { contains: nom, mode: 'insensitive' };
    if (type) where.type = { contains: type, mode: 'insensitive' };
    if (statut) where.statut = statut;
    if (partenariat_id) where.partenariat_id = partenariat_id;
    if (partenaire_id) where.partenaires = { some: { partenaire_id } };

    const [data, total] = await Promise.all([
      this.prisma.projet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.projet.count({ where }),
    ]);

    const enriched = await Promise.all(
      data.map(async (p) => this.enrichir(p)),
    );

    return {
      data: enriched,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, etablissementId?: string): Promise<ProjetResponseDto> {
    const where: any = { id, archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const projet = await this.prisma.projet.findUnique({ where });
    if (!projet) {
      throw new NotFoundException('Projet non trouvé');
    }

    return this.enrichir(projet);
  }

  async update(id: string, dto: UpdateProjetDto, etablissementId?: string) {
    const projet = await this.findOne(id, etablissementId);

    if (projet.statut !== StatutProjet.BROUILLON) {
      throw new ForbiddenException('Ce projet n\'est plus modifiable (statut différent de BROUILLON)');
    }

    const { etablissement_id, partenaires_ids, beneficiaires_ids, bailleurs_ids, sites_ids, ...data } = dto;

    await this.prisma.projet.update({
      where: { id },
      data: {
        ...data,
        date_debut: dto.date_debut ? new Date(dto.date_debut) : undefined,
        date_fin_prevue: dto.date_fin_prevue ? new Date(dto.date_fin_prevue) : undefined,
      },
    });

    return this.findOne(id, etablissementId);
  }

  async soumettre(id: string, etablissementId?: string): Promise<ProjetResponseDto> {
    const projet = await this.findOne(id, etablissementId);

    if (projet.statut !== StatutProjet.BROUILLON) {
      throw new ConflictException('Seul un projet en BROUILLON peut être soumis');
    }

    await this.prisma.projet.update({
      where: { id },
      data: { statut: StatutProjet.EN_ATTENTE },
    });

    this.eventEmitter.emit('projet.soumis', {
      type: TypeNotification.PROJET_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Projet soumis : ${projet.nom}`,
      message: `Le projet "${projet.nom}" a été soumis par l'établissement.`,
      reference_type: 'Projet',
      reference_id: id,
    });

    return this.findOne(id, etablissementId);
  }

async archiver(id: string): Promise<ProjetResponseDto> {
  const projet = await this.prisma.projet.findUnique({
    where: { id, archive: false },
  });
  if (!projet) throw new NotFoundException('Projet non trouvé');

  const activitesNonTerminees = await this.prisma.activite.count({
    where: { projet_id: id, terminee: false },
  });

  if (activitesNonTerminees > 0) {
    throw new ConflictException(
      'Impossible d\'archiver un projet avec des activités non terminées',
    );
  }

  const archived = await this.prisma.projet.update({
    where: { id },
    data: { archive: true },
  });

  return this.enrichir(archived);
}

  async getAvancement(id: string) {
    const projet = await this.prisma.projet.findUnique({ where: { id, archive: false } });
    if (!projet) throw new NotFoundException('Projet non trouvé');

    const total = await this.prisma.activite.count({ where: { projet_id: id } });
    const terminees = await this.prisma.activite.count({
      where: { projet_id: id, terminee: true },
    });

    const avancement = total === 0 ? 0 : Math.round((terminees / total) * 100);

    return { projet_id: id, avancement, activites_total: total, activites_terminees: terminees };
  }

private async enrichir(projet: any): Promise<ProjetResponseDto> {
  const total = await this.prisma.activite.count({ where: { projet_id: projet.id } });
  const terminees = await this.prisma.activite.count({
    where: { projet_id: projet.id, terminee: true },
  });
  const avancement = total === 0 ? 0 : Math.round((terminees / total) * 100);

  // Un projet n'est considéré en retard que s'il a démarré et n'est pas finalisé
  const statutsExclusDuRetard = [
    StatutProjet.BROUILLON,
    StatutProjet.TERMINE,
    StatutProjet.EXPIRE,
  ];
  const enRetard =
    !statutsExclusDuRetard.includes(projet.statut) &&
    new Date(projet.date_fin_prevue) < new Date();

  return {
    id: projet.id,
    nom: projet.nom,
    intitule_officiel: projet.intitule_officiel,
    type: projet.type,
    domaine: projet.domaine,
    budget: projet.budget ? Number(projet.budget) : null,
    date_debut: projet.date_debut,
    date_fin_prevue: projet.date_fin_prevue,
    statut: projet.statut,
    archive: projet.archive,
    etablissement_id: projet.etablissement_id,
    partenariat_id: projet.partenariat_id,
    porteur_id: projet.porteur_id,
    avancement,
    en_retard: enRetard,
    created_at: projet.created_at,
    updated_at: projet.updated_at,
  };
}
}