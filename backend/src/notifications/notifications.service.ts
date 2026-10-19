import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { Role } from '../common/enums/role.enum';
import { Notification } from './entities/notification.entity';
import { Utilisateur } from '../auth/entities/utilisateur.entity';

export interface CreateNotificationData {
  titre: string;
  message: string;
  type: TypeNotification;
  priorite?: PrioriteNotification;
  utilisateur_id: string;
  reference_type: string;
  reference_id: string;
  fenetreDedupJours?: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
  ) {}

  async creer(data: CreateNotificationData) {
    const fenetreJours = data.fenetreDedupJours ?? 1;
    const fenetre = new Date(Date.now() - fenetreJours * 24 * 60 * 60 * 1000);

    const existante = await this.notificationRepo.findOne({
      where: {
        utilisateur_id: data.utilisateur_id,
        reference_type: data.reference_type,
        reference_id: data.reference_id,
        type: data.type,
        titre: data.titre,
        date_creation: MoreThanOrEqual(fenetre),
      },
    });
    if (existante) return null;

    const notification = this.notificationRepo.create({
      titre: data.titre,
      message: data.message,
      type: data.type,
      priorite: data.priorite || PrioriteNotification.MOYENNE,
      date_creation: new Date(),
      est_lue: false,
      utilisateur_id: data.utilisateur_id,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
    });
    return this.notificationRepo.save(notification);
  }

  async findAll(query: QueryNotificationDto, utilisateurId: string) {
    const { page = 1, limit = 20, type, priorite, est_lue } = query;
    const where: FindOptionsWhere<Notification> = {
      utilisateur_id: utilisateurId,
    };
    if (type) where.type = type;
    if (priorite) where.priorite = priorite;
    if (est_lue !== undefined) where.est_lue = est_lue;

    const [data, total] = await this.notificationRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { date_creation: 'DESC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async compterNonLues(utilisateurId: string): Promise<{ total: number }> {
    const total = await this.notificationRepo.count({
      where: { utilisateur_id: utilisateurId, est_lue: false },
    });
    return { total };
  }

  async marquerLue(id: string, utilisateurId: string) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification || notification.utilisateur_id !== utilisateurId) {
      throw new NotFoundException('Notification non trouvee');
    }
    await this.notificationRepo.update(id, { est_lue: true });
    return this.notificationRepo.findOneByOrFail({ id });
  }

  async toutMarquerLu(utilisateurId: string): Promise<{ count: number }> {
    const resultat = await this.notificationRepo.update(
      { utilisateur_id: utilisateurId, est_lue: false },
      { est_lue: true },
    );
    return { count: resultat.affected ?? 0 };
  }

  async trouverUtilisateursPresidence(): Promise<string[]> {
    const users = await this.utilisateurRepo.find({
      where: { role: Role.PRESIDENCE, actif: true },
      select: ['id'],
    });
    return users.map((user) => user.id);
  }

  async trouverUtilisateursEtablissement(
    etablissementId: string | null,
  ): Promise<string[]> {
    // Un projet sans etablissement (transversal / Presidence) n'a pas
    // d'utilisateurs d'etablissement a notifier.
    if (!etablissementId) {
      return [];
    }
    const users = await this.utilisateurRepo.find({
      where: {
        etablissement_id: etablissementId,
        actif: true,
        role: Role.ETABLISSEMENT,
      },
      select: ['id'],
    });
    return users.map((user) => user.id);
  }
}
