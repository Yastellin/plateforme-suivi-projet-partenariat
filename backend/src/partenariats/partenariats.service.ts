import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ILike, Repository } from 'typeorm';
import { CreatePartenariatDto } from './dto/create-partenariat.dto';
import { UpdatePartenariatDto } from './dto/update-partenariat.dto';
import { QueryPartenariatDto } from './dto/query-partenariat.dto';
import { PartenariatResponseDto } from './dto/partenariat-response.dto';
import { Partenariat } from './entities/partenariat.entity';
import { PartenariatEtablissement } from './entities/partenariat-etablissement.entity';
import { PartenariatPartenaire } from './entities/partenariat-partenaire.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { StatutPartenariat } from '../common/enums/statut-partenariat.enum';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { Role } from '../common/enums/role.enum';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PartenariatsService {
  constructor(
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(PartenariatEtablissement)
    private peRepo: Repository<PartenariatEtablissement>,
    @InjectRepository(PartenariatPartenaire)
    private ppRepo: Repository<PartenariatPartenaire>,
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    private eventEmitter: EventEmitter2,
    private historique: HistoriqueService,
  ) {}

  async create(
    etablissementId: string,
    dto: CreatePartenariatDto,
  ): Promise<PartenariatResponseDto> {
    return this.partenariatRepo.manager.transaction(async (manager) => {
      const etablissementRepo = manager.getRepository(Etablissement);
      const partenaireRepo = manager.getRepository(Partenaire);
      const partenariatRepo = manager.getRepository(Partenariat);
      const peRepo = manager.getRepository(PartenariatEtablissement);
      const ppRepo = manager.getRepository(PartenariatPartenaire);

      const etablissement = await etablissementRepo.findOneBy({
        id: etablissementId,
      });
      if (!etablissement) {
        throw new NotFoundException('Établissement non trouvé');
      }

      const etablissements = new Map<string, Etablissement>();
      for (const etabId of dto.etablissements_ids) {
        const etab = await etablissementRepo.findOneBy({ id: etabId });
        if (!etab) {
          throw new NotFoundException(`Établissement ${etabId} non trouvé`);
        }
        etablissements.set(etabId, etab);
      }

      const partenaires = new Map<string, Partenaire>();
      for (const partId of dto.partenaires_ids) {
        const part = await partenaireRepo.findOneBy({ id: partId });
        if (!part) {
          throw new NotFoundException(`Partenaire ${partId} non trouvé`);
        }
        partenaires.set(partId, part);
      }

      const partenariat = partenariatRepo.create({
        intitule: dto.intitule,
        objet: dto.objet ?? null,
        domaine: dto.domaine,
        date_debut: new Date(dto.date_debut),
        date_fin: dto.date_fin ? new Date(dto.date_fin) : null,
        statut: dto.statut || StatutPartenariat.BROUILLON,
        actions_realisees: dto.actions_realisees ?? null,
        actions_en_cours: dto.actions_en_cours ?? null,
        actions_prevues: dto.actions_prevues ?? null,
        resultats_obtenus: dto.resultats_obtenus ?? null,
        difficultes_contraintes: dto.difficultes_contraintes ?? null,
        perspectives_recommandations: dto.perspectives_recommandations ?? null,
        archive: false,
      });
      await partenariatRepo.save(partenariat);

      partenariat.etablissements = await peRepo.save(
        dto.etablissements_ids.map((id) =>
          peRepo.create({
            partenariat_id: partenariat.id,
            etablissement_id: id,
            etablissement: etablissements.get(id)!,
          }),
        ),
      );
      partenariat.partenaires = await ppRepo.save(
        dto.partenaires_ids.map((id) =>
          ppRepo.create({
            partenariat_id: partenariat.id,
            partenaire_id: id,
            partenaire: partenaires.get(id)!,
          }),
        ),
      );

      return this.mapToResponse(partenariat);
    });
  }

  async findAll(query: QueryPartenariatDto, etablissementId?: string) {
    const { page = 1, limit = 20, intitule, domaine, statut, archive } = query;
    const where: any = { archive: archive ?? false };

    if (etablissementId) {
      where.etablissements = { etablissement_id: etablissementId };
    }
    if (intitule) where.intitule = ILike(`%${intitule}%`);
    if (domaine) where.domaine = domaine;
    if (statut) where.statut = statut;

    const [data, total] = await this.partenariatRepo.findAndCount({
      where,
      relations: {
        etablissements: { etablissement: true },
        partenaires: { partenaire: true },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: data.map((partenariat) => this.mapToResponse(partenariat)),
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
      where.etablissements = { etablissement_id: etablissementId };
    }

    const partenariat = await this.partenariatRepo.findOne({
      where,
      relations: {
        etablissements: { etablissement: true },
        partenaires: { partenaire: true },
      },
    });

    if (!partenariat) {
      throw new NotFoundException('Partenariat non trouvé');
    }

    return this.mapToResponse(partenariat);
  }

  async update(
    id: string,
    dto: UpdatePartenariatDto,
    etablissementId?: string,
    userRole?: Role,
  ) {
    const existing = await this.findOne(id, etablissementId);

    if (
      userRole !== Role.PRESIDENCE &&
      existing.statut !== StatutPartenariat.BROUILLON
    ) {
      throw new ForbiddenException(
        "Ce partenariat n'est plus modifiable (statut différent de BROUILLON)",
      );
    }

    const updateData: any = {};
    if (dto.intitule) updateData.intitule = dto.intitule;
    if (dto.objet !== undefined) updateData.objet = dto.objet;
    if (dto.domaine) updateData.domaine = dto.domaine;
    if (dto.date_debut) updateData.date_debut = new Date(dto.date_debut);
    if (dto.date_fin !== undefined) {
      updateData.date_fin = dto.date_fin ? new Date(dto.date_fin) : null;
    }
    if (dto.statut) updateData.statut = dto.statut;
    if (dto.actions_realisees !== undefined) {
      updateData.actions_realisees = dto.actions_realisees;
    }
    if (dto.actions_en_cours !== undefined) {
      updateData.actions_en_cours = dto.actions_en_cours;
    }
    if (dto.actions_prevues !== undefined) {
      updateData.actions_prevues = dto.actions_prevues;
    }
    if (dto.resultats_obtenus !== undefined) {
      updateData.resultats_obtenus = dto.resultats_obtenus;
    }
    if (dto.difficultes_contraintes !== undefined) {
      updateData.difficultes_contraintes = dto.difficultes_contraintes;
    }
    if (dto.perspectives_recommandations !== undefined) {
      updateData.perspectives_recommandations =
        dto.perspectives_recommandations;
    }

    await this.partenariatRepo.update(id, updateData);
    return this.findOne(id, etablissementId);
  }

  async soumettre(
    id: string,
    etablissementId?: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenariat = await this.findOne(id, etablissementId);

    if (partenariat.statut !== StatutPartenariat.BROUILLON) {
      throw new ConflictException(
        'Seul un partenariat en BROUILLON peut être soumis',
      );
    }

    await this.partenariatRepo.update(id, {
      statut: StatutPartenariat.EN_ATTENTE,
      soumis_le: new Date(),
    });

    this.eventEmitter.emit('partenariat.soumis', {
      type: TypeNotification.PARTENARIAT_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Partenariat soumis : ${partenariat.intitule}`,
      message: `Le partenariat "${partenariat.intitule}" a été soumis par l'établissement.`,
      utilisateur_id: null,
      reference_type: 'Partenariat',
      reference_id: id,
    });

    await this.historique.enregistrer({
      action: ActionHistorique.SOUMISSION,
      entite_type: 'Partenariat',
      entite_id: id,
      entite_nom: partenariat.intitule,
      utilisateur: utilisateur ?? null,
    });

    return this.findOne(id, etablissementId);
  }

  /** Soumission en masse : chaque identifiant est traite individuellement. */
  async soumettreEnMasse(
    ids: string[],
    etablissementId?: string,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<{ total: number; reussis: string[]; echecs: { id: string; erreur: string }[] }> {
    if (ids.length === 0) {
      throw new BadRequestException('Aucun partenariat selectionne');
    }

    const reussis: string[] = [];
    const echecs: { id: string; erreur: string }[] = [];

    for (const id of ids) {
      try {
        await this.soumettre(id, etablissementId, utilisateur);
        reussis.push(id);
      } catch (erreur) {
        echecs.push({
          id,
          erreur: erreur instanceof Error ? erreur.message : String(erreur),
        });
      }
    }

    if (reussis.length === 0 && echecs.length > 0) {
      throw new BadRequestException(
        `Aucun partenariat n'a pu etre soumis : ${echecs
          .map((e) => e.erreur)
          .join(' ; ')}`,
      );
    }

    return { total: ids.length, reussis, echecs };
  }

  /** La presidence valide et publie un partenariat soumis. */
  async publier(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenariat = await this.findOne(id);

    if (!partenariat.soumis_le) {
      throw new ConflictException(
        'Seul un partenariat soumis a la presidence peut etre publie',
      );
    }

    await this.partenariatRepo.update(id, { publie_le: new Date() });

    this.eventEmitter.emit('partenariat.publie', {
      type: TypeNotification.PARTENARIAT_PUBLIE,
      priorite: PrioriteNotification.MOYENNE,
      titre: `Partenariat publie : ${partenariat.intitule}`,
      message: `Le partenariat "${partenariat.intitule}" a ete publie par la presidence.`,
      utilisateur_id: null,
      reference_type: 'Partenariat',
      reference_id: id,
      etablissements_ids: (partenariat.etablissements ?? []).map(
        (lien) => (lien as any).etablissement_id,
      ),
    });

    await this.historique.enregistrer({
      action: ActionHistorique.PUBLICATION,
      entite_type: 'Partenariat',
      entite_id: id,
      entite_nom: partenariat.intitule,
      utilisateur: utilisateur ?? null,
    });

    return this.findOne(id);
  }

  async archiver(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenariat = await this.partenariatRepo.findOne({
      where: { id, archive: false },
      relations: {
        etablissements: { etablissement: true },
        partenaires: { partenaire: true },
      },
    });
    if (!partenariat) throw new NotFoundException('Partenariat non trouvé');

    const projetsActifs = await this.partenariatRepo.manager.query(
      `SELECT COUNT(*)::int AS count
       FROM "Projet"
       WHERE "partenariat_id" = $1
         AND "archive" = false
         AND "statut" NOT IN ($2, $3)`,
      [id, 'TERMINE', 'EXPIRE'],
    );

    if (Number(projetsActifs[0].count) > 0) {
      throw new ConflictException(
        "Impossible d'archiver un partenariat avec des projets actifs",
      );
    }

    await this.partenariatRepo.update(id, { archive: true });

    await this.historique.enregistrer({
      action: ActionHistorique.ARCHIVAGE,
      entite_type: 'Partenariat',
      entite_id: id,
      entite_nom: partenariat.intitule,
      utilisateur: utilisateur ?? null,
    });

    return this.findOne(id, undefined, true);
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
      soumis_le: data.soumis_le,
      publie_le: data.publie_le,
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
