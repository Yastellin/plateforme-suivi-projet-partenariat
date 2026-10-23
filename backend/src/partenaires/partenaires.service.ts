import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
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
import { CoordonneesService } from '../coordonnees/coordonnees.service';
import { Role } from '../common/enums/role.enum';
import type { PerimetreListeDonnees } from '../common/utils/perimetre-liste';
import { nommerEtablissementSoumission } from '../common/utils/notification-soumission';

@Injectable()
export class PartenairesService {
  constructor(
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    private eventEmitter: EventEmitter2,
    private historique: HistoriqueService,
    @Inject(STORAGE_PORT) private storage: StoragePort,
    private dataSource: DataSource,
    private coordonnees: CoordonneesService,
  ) {}

  async create(
    etablissementId: string,
    dto: CreatePartenaireDto,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<Partenaire> {
    await this.verifierDoublonIdentite(dto.nom, dto.pays, etablissementId);

    const partenaireId = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Partenaire);
      const email = dto.email?.trim() || dto.emails?.[0]?.trim() || null;
      const telephone =
        dto.telephone?.trim() || dto.telephones?.[0]?.trim() || null;
      const partenaire = await repo.save(
        repo.create({
          nom: dto.nom.trim(),
          type: dto.type.trim(),
          pays: dto.pays.trim(),
          adresse: dto.adresse?.trim() || null,
          telephone,
          email,
          site_web: dto.site_web?.trim() || null,
          description: dto.description?.trim() || null,
          statut: dto.statut || StatutPartenaire.ACTIF,
          visibilite: dto.visibilite || Visibilite.PRIVE,
          est_strategique: dto.est_strategique || false,
          etablissement_id: etablissementId,
          cree_par_utilisateur_id: utilisateur?.id ?? null,
          cree_par_role: utilisateur?.role ?? null,
        }),
      );
      await this.coordonnees.synchroniserPartenaire(
        partenaire.id,
        dto,
        manager,
      );
      return partenaire.id;
    });

    return this.findOne(partenaireId, etablissementId);
  }

  async findAll(
    query: QueryPartenaireDto,
    perimetre: PerimetreListeDonnees = {},
  ) {
    const { page = 1, limit = 20, nom, type, pays, statut, visibilite } = query;

    const where: FindOptionsWhere<Partenaire> = { archive: false };
    const etablissementFiltre =
      perimetre.etablissementId ?? query.etablissement_id;
    if (etablissementFiltre) where.etablissement_id = etablissementFiltre;
    if (perimetre.origine) where.cree_par_role = perimetre.origine;
    if (perimetre.soumisesUniquement) where.soumis_le = Not(IsNull());
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
    const where: FindOptionsWhere<Partenaire> = { id, archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const partenaire = await this.partenaireRepo.findOne({
      where,
      relations: { contacts: true, etablissement: true },
    });

    if (!partenaire) throw new NotFoundException('Partenaire non trouvé');
    const [valeurs, contacts] = await Promise.all([
      this.coordonnees.valeursPartenaire(partenaire.id),
      Promise.all(
        (partenaire.contacts ?? []).map(async (contact) =>
          Object.assign(
            contact,
            await this.coordonnees.valeursContact(contact.id),
          ),
        ),
      ),
    ]);
    partenaire.contacts = contacts;
    return Object.assign(partenaire, valeurs);
  }

  async update(id: string, dto: UpdatePartenaireDto, etablissementId?: string) {
    const partenaire = await this.findOne(id, etablissementId);
    if (etablissementId && partenaire.cree_par_role !== Role.ETABLISSEMENT) {
      throw new ForbiddenException(
        'Un établissement ne peut modifier que les partenaires qu’il a créés.',
      );
    }
    if (etablissementId && partenaire.soumis_le) {
      throw new ConflictException(
        'Un partenaire déjà soumis ne peut plus être modifié par l’établissement.',
      );
    }
    const nom = dto.nom?.trim() ?? partenaire.nom;
    const pays = dto.pays?.trim() ?? partenaire.pays;
    await this.verifierDoublonIdentite(
      nom,
      pays,
      partenaire.etablissement_id,
      id,
    );

    const existantes = await this.coordonnees.valeursPartenaire(id);
    const emails =
      dto.emails ?? (dto.email !== undefined ? [] : existantes.emails);
    const telephones =
      dto.telephones ??
      (dto.telephone !== undefined ? [] : existantes.telephones);
    const email =
      dto.email !== undefined
        ? dto.email?.trim() || emails[0] || null
        : (emails[0] ?? partenaire.email);
    const telephone =
      dto.telephone !== undefined
        ? dto.telephone?.trim() || telephones[0] || null
        : (telephones[0] ?? partenaire.telephone);

    await this.dataSource.transaction(async (manager) => {
      await this.coordonnees.synchroniserPartenaire(
        id,
        { email, emails, telephone, telephones },
        manager,
      );
      const champs: Partial<Partenaire> = { nom, pays, email, telephone };
      if (dto.type !== undefined) champs.type = dto.type;
      if (dto.adresse !== undefined) champs.adresse = dto.adresse ?? null;
      if (dto.site_web !== undefined) champs.site_web = dto.site_web ?? null;
      if (dto.description !== undefined) {
        champs.description = dto.description ?? null;
      }
      if (dto.statut !== undefined) champs.statut = dto.statut;
      if (dto.visibilite !== undefined) champs.visibilite = dto.visibilite;
      if (dto.est_strategique !== undefined) {
        champs.est_strategique = dto.est_strategique;
      }
      await manager.getRepository(Partenaire).update(id, champs);
    });

    return this.findOne(id, etablissementId);
  }

  async archiver(id: string, utilisateur?: ContexteUtilisateur | null) {
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

    const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!MIME_AUTORISES.includes(fichier.mimetype)) {
      throw new BadRequestException(
        'Format de logo non autorise (JPEG, PNG ou WebP)',
      );
    }

    const partenaire = await this.findOne(id, etablissementId);
    if (etablissementId && partenaire.cree_par_role !== Role.ETABLISSEMENT) {
      throw new ForbiddenException(
        'Un établissement ne peut modifier que les partenaires qu’il a créés.',
      );
    }
    if (etablissementId && partenaire.soumis_le) {
      throw new ConflictException(
        "Le logo d'un partenaire déjà soumis ne peut plus être modifié par l'établissement.",
      );
    }
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

    if (partenaire.cree_par_role !== Role.ETABLISSEMENT) {
      throw new ConflictException(
        'Seuls les partenaires créés par un établissement peuvent être soumis',
      );
    }
    if (partenaire.publie_le) {
      throw new ConflictException('Ce partenaire est déjà publié');
    }
    if (partenaire.soumis_le) {
      throw new ConflictException(
        'Ce partenaire est deja soumis a la presidence',
      );
    }

    await this.partenaireRepo.update(id, { soumis_le: new Date() });

    await this.eventEmitter.emitAsync('partenaire.soumis', {
      type: TypeNotification.PARTENAIRE_SOUMIS,
      priorite: PrioriteNotification.HAUTE,
      titre: `Partenaire soumis : ${partenaire.nom}`,
      message: `Le partenaire « ${partenaire.nom} » a été soumis par ${nommerEtablissementSoumission(partenaire.etablissement?.nom)}.`,
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
  ): Promise<{
    total: number;
    reussis: string[];
    echecs: { id: string; erreur: string }[];
  }> {
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
  async publier(id: string, utilisateur?: ContexteUtilisateur | null) {
    const partenaire = await this.findOne(id);

    const estDonneePresidence = partenaire.cree_par_role === Role.PRESIDENCE;
    if (!partenaire.soumis_le && !estDonneePresidence) {
      throw new ConflictException(
        'Seul un partenaire soumis ou créé par la Présidence peut être publié',
      );
    }
    if (partenaire.publie_le) {
      throw new ConflictException('Ce partenaire est déjà publié');
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

  async rechercherDoublon(
    criteres: {
      nom?: string;
      pays?: string;
      type?: string;
      email?: string;
      telephone?: string;
    },
    etablissementId?: string,
  ) {
    const doublonsCoordonnees =
      criteres.email || criteres.telephone
        ? await this.coordonnees.rechercher(criteres.email, criteres.telephone)
        : [];
    if (!criteres.nom?.trim()) return doublonsCoordonnees;

    const nomCanonique = this.canoniser(criteres.nom);
    const requete = this.partenaireRepo
      .createQueryBuilder('partenaire')
      .where('partenaire.archive = false')
      .andWhere('partenaire.nom ILIKE :nom', {
        nom: `%${criteres.nom.trim()}%`,
      });
    if (etablissementId) {
      requete.andWhere('partenaire.etablissement_id = :etablissementId', {
        etablissementId,
      });
    }
    const candidats = await requete.take(10).getMany();

    const doublonsIdentite = candidats.map((partenaire) => {
      const raisons: string[] = [];
      if (this.canoniser(partenaire.nom) === nomCanonique)
        raisons.push('nom identique');
      if (
        criteres.pays &&
        this.canoniser(partenaire.pays) === this.canoniser(criteres.pays)
      )
        raisons.push('pays identique');
      if (
        criteres.type &&
        this.canoniser(partenaire.type) === this.canoniser(criteres.type)
      )
        raisons.push('type identique');
      return { ...partenaire, raisons_doublon: raisons };
    });
    return [...doublonsIdentite, ...doublonsCoordonnees];
  }

  private async verifierDoublonIdentite(
    nom: string,
    pays: string,
    etablissementId: string,
    idExclu?: string,
  ): Promise<void> {
    const requete = this.partenaireRepo
      .createQueryBuilder('partenaire')
      .where('partenaire.archive = false')
      .andWhere('partenaire.etablissement_id = :etablissementId', {
        etablissementId,
      })
      .andWhere('lower(trim(partenaire.nom)) = lower(trim(:nom))', { nom })
      .andWhere('lower(trim(partenaire.pays)) = lower(trim(:pays))', { pays });
    if (idExclu) requete.andWhere('partenaire.id != :idExclu', { idExclu });
    if (await requete.getExists()) {
      throw new ConflictException(
        `Un partenaire nommé « ${nom.trim()} » existe déjà dans ce pays pour cet établissement.`,
      );
    }
  }

  /** Même normalisation que l'index SQL uq_partenaire_identite_active. */
  private canoniser(valeur: string): string {
    return valeur.trim().toLocaleLowerCase('fr');
  }
}
