import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { MessageContact } from './entities/message-contact.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { CreateMessageContactDto } from './dto/create-message-contact.dto';
import { QueryMessageContactDto } from './dto/query-message-contact.dto';
import { Role } from '../common/enums/role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MESSAGE_CONTACT_RECU,
  type MessageContactRecuEvent,
} from './events/message-contact-recu.event';

export interface UtilisateurConnecte {
  id: string;
  role: Role;
  etablissement_id: string | null;
}

@Injectable()
export class MessagesContactService {
  constructor(
    @InjectRepository(MessageContact)
    private readonly messageRepo: Repository<MessageContact>,
    @InjectRepository(Etablissement)
    private readonly etablissementRepo: Repository<Etablissement>,
    private readonly events: EventEmitter2,
  ) {}

  // Enregistre le message et renvoie un accusé de réception (sans donnée
  // personnelle en retour).
  async creer(dto: CreateMessageContactDto) {
    let etablissementId: string | null = null;
    if (dto.etablissement_id) {
      const etablissement = await this.etablissementRepo.findOneBy({
        id: dto.etablissement_id,
      });
      if (!etablissement) {
        throw new BadRequestException(
          "L'établissement destinataire est introuvable.",
        );
      }
      etablissementId = etablissement.id;
    }

    let telephone: string | null = null;
    if (dto.telephone) {
      try {
        const analyse = parsePhoneNumberWithError(dto.telephone, 'MG');
        if (!analyse.isValid()) throw new Error('invalide');
        telephone = analyse.format('E.164');
      } catch {
        throw new BadRequestException(
          'Le numéro de téléphone n’est pas valide.',
        );
      }
    }

    const enregistre = await this.messageRepo.save(
      this.messageRepo.create({
        nom: dto.nom,
        email: dto.email,
        telephone,
        sujet: dto.sujet,
        message: dto.message,
        etablissement_id: etablissementId,
        est_lu: false,
        date_lecture: null,
        date_creation: new Date(),
      }),
    );

    // Notifications et e-mails envoyes en arriere-plan : l'envoi ne doit pas
    // attendre le serveur SMTP ni echouer a cause de lui.
    const evenement: MessageContactRecuEvent = {
      messageId: enregistre.id,
      reference: enregistre.reference,
      nom: enregistre.nom,
      email: enregistre.email,
      telephone: enregistre.telephone,
      sujet: enregistre.sujet,
      etablissementId: enregistre.etablissement_id,
    };
    this.events.emit(MESSAGE_CONTACT_RECU, evenement);

    return {
      id: enregistre.id,
      reference: enregistre.reference,
      date_creation: enregistre.date_creation,
    };
  }

  // Périmètre de visibilité : la Présidence voit tout ; un utilisateur d'un
  // établissement ne voit que les messages qui lui sont destinés.
  private perimetre(
    user: UtilisateurConnecte,
  ): FindOptionsWhere<MessageContact> | null {
    if (user.role === Role.PRESIDENCE) return {};
    if (user.role === Role.ETABLISSEMENT && user.etablissement_id) {
      return { etablissement_id: user.etablissement_id };
    }
    return null;
  }

  async findAll(query: QueryMessageContactDto, user: UtilisateurConnecte) {
    const { page = 1, limit = 20, est_lu } = query;
    const perimetre = this.perimetre(user);
    if (!perimetre) {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const where: FindOptionsWhere<MessageContact> = { ...perimetre };
    if (est_lu !== undefined) where.est_lu = est_lu;

    const [data, total] = await this.messageRepo.findAndCount({
      where,
      relations: { etablissement: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { date_creation: 'DESC' },
    });

    return {
      data: data.map((m) => this.versReponse(m)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async compterNonLus(user: UtilisateurConnecte): Promise<{ total: number }> {
    const perimetre = this.perimetre(user);
    if (!perimetre) return { total: 0 };
    const total = await this.messageRepo.count({
      where: { ...perimetre, est_lu: false },
    });
    return { total };
  }

  async marquerLu(id: string, user: UtilisateurConnecte) {
    const perimetre = this.perimetre(user);
    const message = perimetre
      ? await this.messageRepo.findOne({
          where: { id, ...perimetre },
          relations: { etablissement: true },
        })
      : null;
    if (!message) {
      throw new NotFoundException('Message introuvable.');
    }
    if (!message.est_lu) {
      message.est_lu = true;
      message.date_lecture = new Date();
      await this.messageRepo.save(message);
    }
    return this.versReponse(message);
  }

  private versReponse(m: MessageContact) {
    return {
      id: m.id,
      reference: m.reference,
      nom: m.nom,
      email: m.email,
      telephone: m.telephone,
      sujet: m.sujet,
      message: m.message,
      est_lu: m.est_lu,
      date_lecture: m.date_lecture,
      date_creation: m.date_creation,
      destinataire: m.etablissement
        ? {
            id: m.etablissement.id,
            nom: m.etablissement.nom,
            sigle: m.etablissement.sigle,
          }
        : null,
    };
  }
}
