import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { QueryProjetDto } from './dto/query-projet.dto';
import { ProjetResponseDto } from './dto/projet-response.dto';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { Projet } from './entities/projet.entity';
import { ProjetPartenaire } from './entities/projet-partenaire.entity';
import { ProjetBeneficiaire } from './entities/projet-beneficiaire.entity';
import { ProjetBailleur } from './entities/projet-bailleur.entity';
import { ProjetSite } from './entities/projet-site.entity';
import { Activite } from './entities/activite.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';

@Injectable()
export class ProjetsService {
  constructor(
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
    @InjectRepository(ProjetPartenaire)
    private projetPartenaireRepo: Repository<ProjetPartenaire>,
    @InjectRepository(ProjetBeneficiaire)
    private projetBeneficiaireRepo: Repository<ProjetBeneficiaire>,
    @InjectRepository(ProjetBailleur)
    private projetBailleurRepo: Repository<ProjetBailleur>,
    @InjectRepository(ProjetSite)
    private projetSiteRepo: Repository<ProjetSite>,
    @InjectRepository(Activite)
    private activiteRepo: Repository<Activite>,
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private historique: HistoriqueService,
  ) {}

  async create(
    etablissementId: string | null,
    dto: CreateProjetDto,
  ): Promise<ProjetResponseDto> {
    const projetId = await this.dataSource.transaction(async (manager) => {
      const etablissementRepo = manager.getRepository(Etablissement);
      const partenariatRepo = manager.getRepository(Partenariat);
      const projetRepo = manager.getRepository(Projet);

      // L'etablissement est facultatif (projet transversal ou gere par la
      // Presidence) : on ne verifie son existence que s'il est fourni.
      if (etablissementId) {
        const etablissement = await etablissementRepo.findOneBy({
          id: etablissementId,
        });
        if (!etablissement) {
          throw new NotFoundException('Établissement non trouvé');
        }
      }

      if (dto.partenariat_id) {
        const partenariat = await partenariatRepo.findOneBy({
          id: dto.partenariat_id,
          archive: false,
        });
        if (!partenariat) {
          throw new NotFoundException('Partenariat non trouvé');
        }
      }

      const projet = projetRepo.create({
        nom: dto.nom,
        intitule_officiel: dto.intitule_officiel ?? null,
        type: dto.type,
        domaine: dto.domaine ?? null,
        budget: dto.budget ?? null,
        date_debut: new Date(dto.date_debut),
        date_fin_prevue: new Date(dto.date_fin_prevue),
        statut: dto.statut || StatutProjet.BROUILLON,
        archive: false,
        etablissement_id: etablissementId,
        partenariat_id: dto.partenariat_id ?? null,
        porteur_id: dto.porteur_id ?? null,
      });

      const savedProjet = await projetRepo.save(projet);
      const projetPartenaireRepo = manager.getRepository(ProjetPartenaire);
      const projetBeneficiaireRepo = manager.getRepository(ProjetBeneficiaire);
      const projetBailleurRepo = manager.getRepository(ProjetBailleur);
      const projetSiteRepo = manager.getRepository(ProjetSite);

      if (dto.partenaires_ids) {
        await projetPartenaireRepo.save(
          dto.partenaires_ids.map((partenaire_id) =>
            projetPartenaireRepo.create({
              projet_id: savedProjet.id,
              partenaire_id,
            }),
          ),
        );
      }
      if (dto.beneficiaires_ids) {
        await projetBeneficiaireRepo.save(
          dto.beneficiaires_ids.map((beneficiaire_id) =>
            projetBeneficiaireRepo.create({
              projet_id: savedProjet.id,
              beneficiaire_id,
            }),
          ),
        );
      }
      if (dto.bailleurs_ids) {
        await projetBailleurRepo.save(
          dto.bailleurs_ids.map((bailleur_id) =>
            projetBailleurRepo.create({
              projet_id: savedProjet.id,
              bailleur_id,
            }),
          ),
        );
      }
      if (dto.sites_ids) {
        await projetSiteRepo.save(
          dto.sites_ids.map((site_id) =>
            projetSiteRepo.create({
              projet_id: savedProjet.id,
              site_id,
            }),
          ),
        );
      }

      return savedProjet.id;
    });

    return this.findOne(projetId, etablissementId);
  }

  async findAll(query: QueryProjetDto, etablissementId?: string) {
    const {
      page = 1,
      limit = 20,
      nom,
      type,
      statut,
      partenariat_id,
      partenaire_id,
      archive,
    } = query;

    const where: any = { archive: archive !== undefined ? archive : false };
    if (etablissementId) where.etablissement_id = etablissementId;
    if (nom) where.nom = ILike(`%${nom}%`);
    if (type) where.type = ILike(`%${type}%`);
    if (statut) where.statut = statut;
    if (partenariat_id) where.partenariat_id = partenariat_id;
    if (partenaire_id) {
      where.partenaires = { partenaire_id };
    }

    const [data, total] = await this.projetRepo.findAndCount({
      where,
      relations: {
        etablissement: true,
        partenariat: true,
        porteur: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const enriched = await Promise.all(
      data.map((projet) => this.enrichir(projet)),
    );

    return {
      data: enriched,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(
    id: string,
    etablissementId?: string | null,
  ): Promise<ProjetResponseDto> {
    const where: any = { id, archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const projet = await this.projetRepo.findOne({
      where,
      relations: {
        etablissement: true,
        partenariat: true,
        porteur: true,
      },
    });
    if (!projet) {
      throw new NotFoundException('Projet non trouvé');
    }

    return this.enrichir(projet);
  }

  async update(id: string, dto: UpdateProjetDto, etablissementId?: string) {
    const projet = await this.findOne(id, etablissementId);

    if (projet.statut !== StatutProjet.BROUILLON) {
      throw new ForbiddenException(
        "Ce projet n'est plus modifiable (statut différent de BROUILLON)",
      );
    }

    const updateData: Partial<Projet> = {};
    if (dto.nom !== undefined) updateData.nom = dto.nom;
    if (dto.intitule_officiel !== undefined) {
      updateData.intitule_officiel = dto.intitule_officiel ?? null;
    }
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.domaine !== undefined) updateData.domaine = dto.domaine ?? null;
    if (dto.budget !== undefined) updateData.budget = dto.budget ?? null;
    if (dto.date_debut) updateData.date_debut = new Date(dto.date_debut);
    if (dto.date_fin_prevue) {
      updateData.date_fin_prevue = new Date(dto.date_fin_prevue);
    }
    if (dto.statut !== undefined) updateData.statut = dto.statut;
    if (dto.partenariat_id !== undefined) {
      updateData.partenariat_id = dto.partenariat_id ?? null;
    }
    if (dto.porteur_id !== undefined) {
      updateData.porteur_id = dto.porteur_id ?? null;
    }

    await this.projetRepo.update(id, updateData);
    return this.findOne(id, etablissementId);
  }

  async soumettre(
    id: string,
    etablissementId?: string,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<ProjetResponseDto> {
    const projet = await this.findOne(id, etablissementId);

    if (projet.statut !== StatutProjet.BROUILLON) {
      throw new ConflictException(
        'Seul un projet en BROUILLON peut être soumis',
      );
    }

    await this.projetRepo.update(id, {
      statut: StatutProjet.EN_ATTENTE,
      soumis_le: new Date(),
    });

    this.eventEmitter.emit('projet.soumis', {
      type: TypeNotification.PROJET_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Projet soumis : ${projet.nom}`,
      message: `Le projet "${projet.nom}" a été soumis par l'établissement.`,
      reference_type: 'Projet',
      reference_id: id,
    });

    await this.historique.enregistrer({
      action: ActionHistorique.SOUMISSION,
      entite_type: 'Projet',
      entite_id: id,
      entite_nom: projet.nom,
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
      throw new BadRequestException('Aucun projet selectionne');
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
        `Aucun projet n'a pu etre soumis : ${echecs
          .map((e) => e.erreur)
          .join(' ; ')}`,
      );
    }

    return { total: ids.length, reussis, echecs };
  }

  /** La presidence valide et publie un projet soumis. */
  async publier(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<ProjetResponseDto> {
    const projet = await this.findOne(id);

    if (!projet.soumis_le) {
      throw new ConflictException(
        'Seul un projet soumis a la presidence peut etre publie',
      );
    }

    await this.projetRepo.update(id, { publie_le: new Date() });

    this.eventEmitter.emit('projet.publie', {
      type: TypeNotification.PROJET_PUBLIE,
      priorite: PrioriteNotification.MOYENNE,
      titre: `Projet publie : ${projet.nom}`,
      message: `Le projet "${projet.nom}" a ete publie par la presidence.`,
      reference_type: 'Projet',
      reference_id: id,
      etablissement_id: projet.etablissement_id,
    });

    await this.historique.enregistrer({
      action: ActionHistorique.PUBLICATION,
      entite_type: 'Projet',
      entite_id: id,
      entite_nom: projet.nom,
      utilisateur: utilisateur ?? null,
    });

    return this.findOne(id);
  }

  async archiver(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<ProjetResponseDto> {
    const projet = await this.projetRepo.findOneBy({ id, archive: false });
    if (!projet) throw new NotFoundException('Projet non trouvé');

    // Un projet déjà terminé peut être archivé, même si certaines activités
    // n'ont pas été cochées : seul un projet en cours est bloqué.
    if (projet.statut !== StatutProjet.TERMINE) {
      const activitesNonTerminees = await this.activiteRepo.count({
        where: { projet_id: id, terminee: false },
      });

      if (activitesNonTerminees > 0) {
        throw new ConflictException(
          "Impossible d'archiver un projet avec des activités non terminées",
        );
      }
    }

    await this.projetRepo.update(id, { archive: true });
    projet.archive = true;

    await this.historique.enregistrer({
      action: ActionHistorique.ARCHIVAGE,
      entite_type: 'Projet',
      entite_id: projet.id,
      entite_nom: projet.nom,
      utilisateur: utilisateur ?? null,
    });

    return this.enrichir(projet);
  }

  async getAvancement(id: string) {
    const projet = await this.projetRepo.findOneBy({ id, archive: false });
    if (!projet) throw new NotFoundException('Projet non trouvé');

    const [total, terminees] = await Promise.all([
      this.activiteRepo.count({ where: { projet_id: id } }),
      this.activiteRepo.count({ where: { projet_id: id, terminee: true } }),
    ]);

    const avancement = total === 0 ? 0 : Math.round((terminees / total) * 100);

    return {
      projet_id: id,
      avancement,
      activites_total: total,
      activites_terminees: terminees,
    };
  }

  private async enrichir(projet: Projet): Promise<ProjetResponseDto> {
    const [total, terminees] = await Promise.all([
      this.activiteRepo.count({ where: { projet_id: projet.id } }),
      this.activiteRepo.count({
        where: { projet_id: projet.id, terminee: true },
      }),
    ]);
    const avancement = total === 0 ? 0 : Math.round((terminees / total) * 100);

    const statutsExclusDuRetard = [
      StatutProjet.BROUILLON,
      StatutProjet.TERMINE,
      StatutProjet.EXPIRE,
    ];
    const enRetard =
      !statutsExclusDuRetard.includes(projet.statut) &&
      projet.date_fin_prevue < new Date();

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
      soumis_le: projet.soumis_le,
      publie_le: projet.publie_le,
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
