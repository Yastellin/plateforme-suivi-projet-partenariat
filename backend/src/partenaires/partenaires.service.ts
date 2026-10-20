import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { CreatePartenaireDto } from './dto/create-partenaire.dto';
import { UpdatePartenaireDto } from './dto/update-partenaire.dto';
import { QueryPartenaireDto } from './dto/query-partenaire.dto';
import { Partenaire } from './entities/partenaire.entity';
import { StatutPartenaire } from '../common/enums/statut-partenaire.enum';
import { Visibilite } from '../common/enums/visibilite.enum';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';

@Injectable()
export class PartenairesService {
  constructor(
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    private eventEmitter: EventEmitter2,
    private historique: HistoriqueService,
    @Inject(STORAGE_PORT) private storage: StoragePort,
  ) {}

  async create(
    etablissementId: string,
    dto: CreatePartenaireDto,
  ): Promise<Partenaire> {
    const existant = await this.partenaireRepo.findOne({
      where: {
        nom: dto.nom,
        etablissement_id: etablissementId,
        archive: false,
      },
    });
    if (existant) {
      throw new ConflictException(
        `Un partenaire nomme "${dto.nom}" existe deja pour cet etablissement.`,
      );
    }

    const partenaire = new Partenaire();
    partenaire.nom = dto.nom;
    partenaire.type = dto.type;
    partenaire.pays = dto.pays;
    partenaire.adresse = dto.adresse ?? null;
    partenaire.telephone = dto.telephone ?? null;
    partenaire.email = dto.email ?? null;
    partenaire.site_web = dto.site_web ?? null;
    partenaire.description = dto.description ?? null;
    partenaire.statut = dto.statut || StatutPartenaire.ACTIF;
    partenaire.visibilite = dto.visibilite || Visibilite.PRIVE;
    partenaire.est_strategique = dto.est_strategique || false;
    partenaire.etablissement_id = etablissementId;

    return await this.partenaireRepo.save(partenaire);
  }

  async findAll(query: QueryPartenaireDto, etablissementId?: string) {
    const { page = 1, limit = 20, nom, type, pays, statut, visibilite } = query;

    const where: any = { archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;
    if (nom) where.nom = ILike(`%${nom}%`);
    if (type) where.type = ILike(`%${type}%`);
    if (pays) where.pays = ILike(`%${pays}%`);
    if (statut) where.statut = statut;
    if (visibilite) where.visibilite = visibilite;

    const [data, total] = await this.partenaireRepo.findAndCount({
      where,
      relations: { contacts: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { nom: 'ASC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, etablissementId?: string) {
    const where: any = { id, archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const partenaire = await this.partenaireRepo.findOne({
      where,
      relations: { contacts: true },
    });

    if (!partenaire) throw new NotFoundException('Partenaire non trouve');
    return partenaire;
  }

  async update(id: string, dto: UpdatePartenaireDto, etablissementId?: string) {
    const partenaire = await this.findOne(id, etablissementId);

    const data = { ...dto };

    if (data.nom) {
      const existant = await this.partenaireRepo.findOne({
        where: {
          nom: data.nom,
          etablissement_id: etablissementId,
          id: Not(id),
          archive: false,
        },
      });
      if (existant) {
        throw new ConflictException(
          `Un partenaire nomme "${data.nom}" existe deja.`,
        );
      }
    }

    Object.assign(partenaire, data);
    return this.partenaireRepo.save(partenaire);
  }

  async archiver(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenaire = await this.partenaireRepo.findOne({
      where: { id, archive: false },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouve');

    // Verifications des associations : on les laisse au niveau base (FK)
    // tant que Projet et Partenariat ne sont pas migres.

    await this.partenaireRepo.update(id, { archive: true });

    await this.historique.enregistrer({
      action: ActionHistorique.ARCHIVAGE,
      entite_type: 'Partenaire',
      entite_id: id,
      entite_nom: partenaire.nom,
      utilisateur: utilisateur ?? null,
    });

    return this.partenaireRepo.findOne({ where: { id } });
  }

  /** Televersement du logo du partenaire (image). */
  async televerserLogo(
    id: string,
    fichier: Express.Multer.File,
    etablissementId?: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    if (!fichier) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const MIME_AUTORISES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!MIME_AUTORISES.includes(fichier.mimetype)) {
      throw new BadRequestException(
        'Format de logo non autorise (JPEG, PNG, WebP, SVG)',
      );
    }

    const partenaire = await this.findOne(id, etablissementId);
    const ancienLogo = partenaire.logo_url;

    const urlFichier = await this.storage.enregistrer(
      fichier,
      `logos/partenaires/${id}`,
    );

    await this.partenaireRepo.update(id, { logo_url: urlFichier });

    if (ancienLogo) {
      await this.storage.supprimer(ancienLogo).catch(() => undefined);
    }

    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Partenaire',
      entite_id: id,
      entite_nom: partenaire.nom,
      utilisateur: utilisateur ?? null,
      details: 'Mise a jour du logo',
    });

    return this.findOne(id, etablissementId);
  }

  /** Un etablissement soumet son partenaire a la presidence. */
  async soumettre(
    id: string,
    etablissementId?: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenaire = await this.findOne(id, etablissementId);

    if (partenaire.soumis_le) {
      throw new ConflictException(
        'Ce partenaire est deja soumis a la presidence',
      );
    }

    await this.partenaireRepo.update(id, { soumis_le: new Date() });

    this.eventEmitter.emit('partenaire.soumis', {
      type: TypeNotification.PARTENAIRE_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Partenaire soumis : ${partenaire.nom}`,
      message: `Le partenaire "${partenaire.nom}" a ete soumis par l'etablissement.`,
      reference_type: 'Partenaire',
      reference_id: id,
    });

    await this.historique.enregistrer({
      action: ActionHistorique.SOUMISSION,
      entite_type: 'Partenaire',
      entite_id: id,
      entite_nom: partenaire.nom,
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
      throw new BadRequestException('Aucun partenaire selectionne');
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
        `Aucun partenaire n'a pu etre soumis : ${echecs
          .map((e) => e.erreur)
          .join(' ; ')}`,
      );
    }

    return { total: ids.length, reussis, echecs };
  }

  /** La presidence valide et publie un partenaire soumis. */
  async publier(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const partenaire = await this.findOne(id);

    if (!partenaire.soumis_le) {
      throw new ConflictException(
        'Seul un partenaire soumis a la presidence peut etre publie',
      );
    }

    await this.partenaireRepo.update(id, {
      publie_le: new Date(),
      visibilite: Visibilite.PUBLIC,
    });

    this.eventEmitter.emit('partenaire.publie', {
      type: TypeNotification.PARTENAIRE_PUBLIE,
      priorite: PrioriteNotification.MOYENNE,
      titre: `Partenaire publie : ${partenaire.nom}`,
      message: `Le partenaire "${partenaire.nom}" a ete publie par la presidence.`,
      reference_type: 'Partenaire',
      reference_id: id,
      etablissement_id: partenaire.etablissement_id,
    });

    await this.historique.enregistrer({
      action: ActionHistorique.PUBLICATION,
      entite_type: 'Partenaire',
      entite_id: id,
      entite_nom: partenaire.nom,
      utilisateur: utilisateur ?? null,
    });

    return this.findOne(id);
  }

  async rechercherDoublon(nom: string, etablissementId?: string) {
    const where: any = { nom: ILike(nom), archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    return this.partenaireRepo.findOne({
      where,
      relations: { contacts: true },
    });
  }
}
