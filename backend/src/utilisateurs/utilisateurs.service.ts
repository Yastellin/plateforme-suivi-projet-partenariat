import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from '../auth/entities/utilisateur.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { MOT_DE_PASSE_MODIFIE, MotDePasseModifieEvent } from '../auth/events/mot-de-passe-modifie.event';
import { HistoriqueService } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { Role } from '../common/enums/role.enum';
import { UpdateMotDePasseDto } from './dto/update-mot-de-passe.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateAccesUtilisateurDto } from './dto/update-acces-utilisateur.dto';

const ERREUR_ETABLISSEMENT_EXISTANT =
  'Cet établissement est déjà enregistré. Utilisez son compte existant ou demandez à la Présidence de vérifier la fiche.';

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(Utilisateur) private utilisateurs: Repository<Utilisateur>,
    @InjectRepository(RefreshToken) private refreshTokens: Repository<RefreshToken>,
    @InjectRepository(Etablissement) private etablissements: Repository<Etablissement>,
    private evenements: EventEmitter2,
    private historique: HistoriqueService,
  ) {}

  async compte(id: string) {
    const utilisateur = await this.trouver(id);
    return this.presenter(utilisateur);
  }

  async changerMotDePasse(id: string, dto: UpdateMotDePasseDto) {
    const utilisateur = await this.trouver(id);
    const valide = await bcrypt.compare(dto.mot_de_passe_actuel, utilisateur.password_hash);
    if (!valide) throw new UnauthorizedException('Le mot de passe actuel est incorrect.');
    if (await bcrypt.compare(dto.nouveau_mot_de_passe, utilisateur.password_hash)) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent du mot de passe actuel.');
    }

    await this.utilisateurs.update(id, {
      password_hash: await bcrypt.hash(dto.nouveau_mot_de_passe, 10),
    });
    await this.refreshTokens.update(
      { utilisateur_id: id, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );
    this.evenements.emit(
      MOT_DE_PASSE_MODIFIE,
      new MotDePasseModifieEvent(id, utilisateur.email),
    );
    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Compte',
      entite_id: id,
      entite_nom: utilisateur.email,
      utilisateur: { id, email: utilisateur.email, role: utilisateur.role },
      details: 'Modification du mot de passe',
    });
    return { message: 'Mot de passe modifié. Les autres sessions ont été déconnectées.' };
  }

  async modifierPreferences(id: string, dto: UpdatePreferencesDto) {
    const utilisateur = await this.trouver(id);
    const preferences = { ...(utilisateur.preferences ?? {}), ...dto };
    await this.utilisateurs.update(id, { preferences });
    return { ...this.presenter(utilisateur), preferences };
  }

  async lister() {
    const utilisateurs = await this.utilisateurs.find({
      relations: { etablissement: true },
      order: { email: 'ASC' },
    });
    return utilisateurs.map((utilisateur) => this.presenter(utilisateur));
  }

  async creer(
    dto: CreateUtilisateurDto,
    auteur: { id: string; email: string; role: string },
  ) {
    const email = dto.email.trim().toLocaleLowerCase('fr');
    const emailExiste = await this.utilisateurs
      .createQueryBuilder('utilisateur')
      .where('LOWER(utilisateur.email) = :email', { email })
      .getExists();
    if (emailExiste) {
      throw new ConflictException(
        'Un compte utilise déjà cette adresse e-mail.',
      );
    }
    const nomEtablissement = dto.etablissement_nom
      ?.trim()
      .replace(/\s+/gu, ' ');
    if (dto.role === Role.ETABLISSEMENT && !nomEtablissement) {
      throw new BadRequestException('Le nom de l’établissement est requis.');
    }
    if (dto.role === Role.ETABLISSEMENT) {
      const nomExiste = await this.etablissements
        .createQueryBuilder('etablissement')
        .where(
          `LOWER(BTRIM(REGEXP_REPLACE(etablissement.nom, '[[:space:]]+', ' ', 'g'))) = LOWER(BTRIM(REGEXP_REPLACE(:nom, '[[:space:]]+', ' ', 'g')))`,
          { nom: nomEtablissement },
        )
        .getExists();
      if (nomExiste) {
        throw new ConflictException(ERREUR_ETABLISSEMENT_EXISTANT);
      }
    }
    const passwordHash = await bcrypt.hash(dto.mot_de_passe, 10);

    let resultat: {
      utilisateur: Utilisateur;
      etablissementCree: Etablissement | null;
    };
    try {
      resultat = await this.utilisateurs.manager.transaction(
        async (manager) => {
          let etablissementCree: Etablissement | null = null;
          if (dto.role === Role.ETABLISSEMENT) {
            const depotEtablissement = manager.getRepository(Etablissement);
            etablissementCree = await depotEtablissement.save(
              depotEtablissement.create({ nom: nomEtablissement! }),
            );
          }

          const depotUtilisateur = manager.getRepository(Utilisateur);
          const utilisateur = await depotUtilisateur.save(
            depotUtilisateur.create({
              email,
              password_hash: passwordHash,
              role: dto.role,
              etablissement_id: etablissementCree?.id ?? null,
              actif: true,
              preferences: {},
            }),
          );
          return { utilisateur, etablissementCree };
        },
      );
    } catch (erreur) {
      const erreurBase =
        erreur instanceof QueryFailedError
          ? (erreur.driverError as {
              code?: string;
              constraint?: string;
            })
          : null;
      if (
        erreurBase?.code === '23505' &&
        erreurBase.constraint === 'uq_etablissement_nom_normalise'
      ) {
        throw new ConflictException(ERREUR_ETABLISSEMENT_EXISTANT);
      }
      throw erreur;
    }

    if (resultat.etablissementCree) {
      await this.historique.enregistrer({
        action: ActionHistorique.CREATION,
        entite_type: 'Etablissement',
        entite_id: resultat.etablissementCree.id,
        entite_nom: resultat.etablissementCree.nom,
        utilisateur: auteur,
        details: 'Création lors de la création d’un compte établissement',
      });
    }
    await this.historique.enregistrer({
      action: ActionHistorique.CREATION,
      entite_type: 'Utilisateur',
      entite_id: resultat.utilisateur.id,
      entite_nom: resultat.utilisateur.email,
      utilisateur: auteur,
    });
    return this.compte(resultat.utilisateur.id);
  }

  async modifierAcces(
    id: string,
    dto: UpdateAccesUtilisateurDto,
    auteur: { id: string; email: string; role: string },
  ) {
    const utilisateur = await this.trouver(id);
    if (id === auteur.id && dto.actif === false) {
      throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte.');
    }
    if (id === auteur.id && dto.role && dto.role !== utilisateur.role) {
      throw new BadRequestException('Vous ne pouvez pas modifier votre propre rôle.');
    }
    const role = dto.role ?? utilisateur.role;
    if (
      utilisateur.role === Role.PRESIDENCE &&
      utilisateur.actif &&
      (dto.actif === false || role !== Role.PRESIDENCE)
    ) {
      const autresAdministrateurs = await this.utilisateurs.count({
        where: { role: Role.PRESIDENCE, actif: true },
      });
      if (autresAdministrateurs <= 1) {
        throw new BadRequestException('Au moins un compte Présidence actif doit être conservé.');
      }
    }
    const etablissementId = dto.etablissement_id !== undefined
      ? dto.etablissement_id
      : utilisateur.etablissement_id;
    await this.validerEtablissement(role, etablissementId ?? undefined);

    await this.utilisateurs.update(id, {
      actif: dto.actif,
      role,
      etablissement_id: role === Role.ETABLISSEMENT ? etablissementId : null,
    });
    if (dto.actif === false) {
      await this.refreshTokens.update(
        { utilisateur_id: id, revoked_at: IsNull() },
        { revoked_at: new Date() },
      );
    }
    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Utilisateur',
      entite_id: id,
      entite_nom: utilisateur.email,
      utilisateur: auteur,
      details: `Droits mis à jour : rôle ${role}, actif ${dto.actif ?? utilisateur.actif}`,
    });
    return this.compte(id);
  }

  private async validerEtablissement(role: Role, etablissementId?: string) {
    if (role !== Role.ETABLISSEMENT) return;
    if (!etablissementId) {
      throw new BadRequestException('Un compte établissement doit être rattaché à un établissement.');
    }
    if (!(await this.etablissements.existsBy({ id: etablissementId }))) {
      throw new NotFoundException('Établissement non trouvé.');
    }
  }

  private async trouver(id: string) {
    const utilisateur = await this.utilisateurs.findOne({
      where: { id },
      relations: { etablissement: true },
    });
    if (!utilisateur) throw new NotFoundException('Compte introuvable.');
    return utilisateur;
  }

  private presenter(utilisateur: Utilisateur) {
    return {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      actif: utilisateur.actif,
      etablissement_id: utilisateur.etablissement_id,
      etablissement_nom: utilisateur.etablissement?.nom ?? null,
      derniere_connexion: utilisateur.derniere_connexion,
      preferences: utilisateur.preferences ?? {},
      created_at: utilisateur.created_at,
      updated_at: utilisateur.updated_at,
    };
  }
}
