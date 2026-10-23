import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptionsWhere, ILike, In, IsNull, Not, Repository } from 'typeorm';
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
import type { PerimetreListeDonnees } from '../common/utils/perimetre-liste';
import { nommerEtablissementSoumission } from '../common/utils/notification-soumission';

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
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<PartenariatResponseDto> {
    const partenariatCree = await this.partenariatRepo.manager.transaction(
      async (manager) => {
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
        for (const etabId of [...new Set(dto.etablissements_ids)]) {
          const etab = await etablissementRepo.findOneBy({ id: etabId });
          if (!etab) {
            throw new NotFoundException(`Établissement ${etabId} non trouvé`);
          }
          etablissements.set(etabId, etab);
        }

        const partenaires = new Map<string, Partenaire>();
        for (const partId of [...new Set(dto.partenaires_ids)]) {
          const part = await partenaireRepo.findOneBy({
            id: partId,
            archive: false,
          });
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
          statut:
            utilisateur?.role === Role.ETABLISSEMENT
              ? StatutPartenariat.BROUILLON
              : dto.statut || StatutPartenariat.BROUILLON,
          actions_realisees: dto.actions_realisees ?? null,
          actions_en_cours: dto.actions_en_cours ?? null,
          actions_prevues: dto.actions_prevues ?? null,
          resultats_obtenus: dto.resultats_obtenus ?? null,
          difficultes_contraintes: dto.difficultes_contraintes ?? null,
          perspectives_recommandations:
            dto.perspectives_recommandations ?? null,
          archive: false,
          cree_par_utilisateur_id: utilisateur?.id ?? null,
          cree_par_role: utilisateur?.role ?? null,
        });
        await partenariatRepo.save(partenariat);

        partenariat.etablissements = await peRepo.save(
          [...new Set(dto.etablissements_ids)].map((id) =>
            peRepo.create({
              partenariat_id: partenariat.id,
              etablissement_id: id,
              etablissement: etablissements.get(id)!,
            }),
          ),
        );
        partenariat.partenaires = await ppRepo.save(
          [...new Set(dto.partenaires_ids)].map((id) =>
            ppRepo.create({
              partenariat_id: partenariat.id,
              partenaire_id: id,
              partenaire: partenaires.get(id)!,
            }),
          ),
        );

        return this.mapToResponse(partenariat);
      },
    );

    await this.historique.enregistrer({
      action: ActionHistorique.CREATION,
      entite_type: 'Partenariat',
      entite_id: partenariatCree.id,
      entite_nom: partenariatCree.intitule,
      utilisateur: utilisateur ?? null,
    });
    return partenariatCree;
  }

  async findAll(
    query: QueryPartenariatDto,
    perimetre: PerimetreListeDonnees = {},
  ) {
    const { page = 1, limit = 20, intitule, domaine, statut, archive } = query;
    const where: FindOptionsWhere<Partenariat> = {
      archive: archive ?? false,
    };

    const etablissementFiltre =
      perimetre.etablissementId ?? query.etablissement_id;
    if (etablissementFiltre) {
      where.etablissements = { etablissement_id: etablissementFiltre };
    }
    if (perimetre.origine) where.cree_par_role = perimetre.origine;
    if (perimetre.etatSoumission === 'SOUMISES') {
      where.soumis_le = Not(IsNull());
    } else if (perimetre.etatSoumission === 'NON_SOUMISES') {
      where.soumis_le = IsNull();
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
    const where: FindOptionsWhere<Partenariat> = { id };
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
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const existing = await this.findOne(id, etablissementId);

    if (
      userRole === Role.ETABLISSEMENT &&
      existing.cree_par_role !== Role.ETABLISSEMENT
    ) {
      throw new ForbiddenException(
        'Un établissement ne peut modifier que les partenariats qu’il a créés.',
      );
    }

    if (
      userRole !== Role.PRESIDENCE &&
      (existing.statut !== StatutPartenariat.BROUILLON ||
        Boolean(existing.soumis_le))
    ) {
      throw new ForbiddenException(
        "Ce partenariat n'est plus modifiable après sa soumission.",
      );
    }

    const etablissementsIds =
      dto.etablissements_ids === undefined
        ? undefined
        : [...new Set(dto.etablissements_ids)];
    const partenairesIds =
      dto.partenaires_ids === undefined
        ? undefined
        : [...new Set(dto.partenaires_ids)];

    if (etablissementsIds?.length === 0) {
      throw new BadRequestException('Au moins un établissement est requis.');
    }
    if (partenairesIds?.length === 0) {
      throw new BadRequestException('Au moins un partenaire est requis.');
    }
    if (
      userRole === Role.ETABLISSEMENT &&
      etablissementsIds !== undefined &&
      (etablissementsIds.length !== 1 ||
        etablissementsIds[0] !== etablissementId)
    ) {
      throw new ForbiddenException(
        'Un établissement ne peut pas modifier le rattachement institutionnel du partenariat.',
      );
    }

    const dateDebut = dto.date_debut
      ? new Date(dto.date_debut)
      : new Date(String(existing.date_debut));
    const dateFin =
      dto.date_fin !== undefined
        ? dto.date_fin
          ? new Date(dto.date_fin)
          : null
        : existing.date_fin
          ? new Date(String(existing.date_fin))
          : null;
    if (dateFin && dateFin <= dateDebut) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début.',
      );
    }

    await this.partenariatRepo.manager.transaction(async (manager) => {
      const partenariatRepo = manager.getRepository(Partenariat);
      const etablissementRepo = manager.getRepository(Etablissement);
      const partenaireRepo = manager.getRepository(Partenaire);
      const peRepo = manager.getRepository(PartenariatEtablissement);
      const ppRepo = manager.getRepository(PartenariatPartenaire);

      if (etablissementsIds !== undefined) {
        const etablissements = await etablissementRepo.findBy({
          id: In(etablissementsIds),
        });
        if (etablissements.length !== etablissementsIds.length) {
          throw new NotFoundException(
            'Un établissement sélectionné est introuvable.',
          );
        }
      }
      if (partenairesIds !== undefined) {
        const partenaires = await partenaireRepo.findBy({
          id: In(partenairesIds),
          archive: false,
        });
        if (partenaires.length !== partenairesIds.length) {
          throw new NotFoundException(
            'Un partenaire sélectionné est introuvable.',
          );
        }
      }

      const updateData: Partial<Partenariat> = {};
      if (dto.intitule) updateData.intitule = dto.intitule;
      if (dto.objet !== undefined) updateData.objet = dto.objet ?? null;
      if (dto.domaine) updateData.domaine = dto.domaine;
      if (dto.date_debut) updateData.date_debut = dateDebut;
      if (dto.date_fin !== undefined) updateData.date_fin = dateFin;
      if (dto.statut && userRole === Role.PRESIDENCE) {
        updateData.statut = dto.statut;
      }
      if (dto.actions_realisees !== undefined) {
        updateData.actions_realisees = dto.actions_realisees ?? null;
      }
      if (dto.actions_en_cours !== undefined) {
        updateData.actions_en_cours = dto.actions_en_cours ?? null;
      }
      if (dto.actions_prevues !== undefined) {
        updateData.actions_prevues = dto.actions_prevues ?? null;
      }
      if (dto.resultats_obtenus !== undefined) {
        updateData.resultats_obtenus = dto.resultats_obtenus ?? null;
      }
      if (dto.difficultes_contraintes !== undefined) {
        updateData.difficultes_contraintes =
          dto.difficultes_contraintes ?? null;
      }
      if (dto.perspectives_recommandations !== undefined) {
        updateData.perspectives_recommandations =
          dto.perspectives_recommandations ?? null;
      }

      if (Object.keys(updateData).length > 0) {
        await partenariatRepo.update(id, updateData);
      }

      if (etablissementsIds !== undefined) {
        await peRepo.delete({ partenariat_id: id });
        await peRepo.save(
          etablissementsIds.map((etablissement_id) =>
            peRepo.create({ partenariat_id: id, etablissement_id }),
          ),
        );
      }
      if (partenairesIds !== undefined) {
        await ppRepo.delete({ partenariat_id: id });
        await ppRepo.save(
          partenairesIds.map((partenaire_id) =>
            ppRepo.create({ partenariat_id: id, partenaire_id }),
          ),
        );
      }
    });

    const partenariatMisAJour = await this.findOne(id, etablissementId);
    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Partenariat',
      entite_id: id,
      entite_nom: partenariatMisAJour.intitule,
      utilisateur: utilisateur ?? null,
    });
    return partenariatMisAJour;
  }

  async soumettre(
    id: string,
    etablissementId?: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenariat = await this.findOne(id, etablissementId);

    if (partenariat.cree_par_role !== Role.ETABLISSEMENT) {
      throw new ConflictException(
        'Seuls les partenariats créés par un établissement peuvent être soumis',
      );
    }
    if (partenariat.statut !== StatutPartenariat.BROUILLON) {
      throw new ConflictException(
        'Seul un partenariat en BROUILLON peut être soumis',
      );
    }

    await this.partenariatRepo.update(id, {
      statut: StatutPartenariat.EN_ATTENTE,
      soumis_le: new Date(),
    });

    const etablissementSoumissionnaire =
      partenariat.etablissements.find(
        (etablissement) => etablissement.id === etablissementId,
      ) ?? partenariat.etablissements[0];
    await this.eventEmitter.emitAsync('partenariat.soumis', {
      type: TypeNotification.PARTENARIAT_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Partenariat soumis : ${partenariat.intitule}`,
      message: `Le partenariat « ${partenariat.intitule} » a été soumis par ${nommerEtablissementSoumission(etablissementSoumissionnaire?.nom)}.`,
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
  ): Promise<{
    total: number;
    reussis: string[];
    echecs: { id: string; erreur: string }[];
  }> {
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

  /** La Présidence rend un partenariat soumis visible sur la vitrine. */
  async publier(id: string, utilisateur?: ContexteUtilisateur | null) {
    const partenariat = await this.findOne(id);

    const estDonneePresidence = partenariat.cree_par_role === Role.PRESIDENCE;
    if (!partenariat.soumis_le && !estDonneePresidence) {
      throw new ConflictException(
        'Seul un partenariat soumis ou créé par la Présidence peut être ajouté à la vitrine',
      );
    }
    if (partenariat.publie_le) {
      throw new ConflictException(
        'Ce partenariat est déjà présent sur la vitrine',
      );
    }

    await this.partenariatRepo.update(id, {
      publie_le: new Date(),
      statut:
        partenariat.statut === StatutPartenariat.BROUILLON ||
        partenariat.statut === StatutPartenariat.EN_ATTENTE
          ? StatutPartenariat.EN_COURS
          : partenariat.statut,
    });

    this.eventEmitter.emit('partenariat.publie', {
      type: TypeNotification.PARTENARIAT_PUBLIE,
      priorite: PrioriteNotification.MOYENNE,
      titre: `Partenariat ajouté à la vitrine : ${partenariat.intitule}`,
      message: `Le partenariat « ${partenariat.intitule} » a été ajouté à la vitrine par la Présidence.`,
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

  async archiver(id: string, utilisateur?: ContexteUtilisateur | null) {
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
      cree_par_role: data.cree_par_role,
      created_at: data.created_at,
      updated_at: data.updated_at,
      etablissements: data.etablissements.map((e: any) => ({
        id: e.etablissement.id,
        nom: e.etablissement.nom,
        sigle: e.etablissement.sigle,
        logo_url: e.etablissement.logo_url,
      })),
      partenaires: data.partenaires.map((p: any) => ({
        id: p.partenaire.id,
        nom: p.partenaire.nom,
        logo_url: p.partenaire.logo_url,
      })),
    };
  }
}
