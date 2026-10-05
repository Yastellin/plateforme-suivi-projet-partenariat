import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { TypeNotification } from '../common/enums/type-notification.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { Role } from '../common/enums/role.enum';

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
  constructor(private prisma: PrismaService) {}

  async creer(data: CreateNotificationData) {
    const fenetreJours = data.fenetreDedupJours ?? 1;
    const fenetre = new Date(Date.now() - fenetreJours * 24 * 60 * 60 * 1000);

    const existante = await this.prisma.notification.findFirst({
      where: {
        utilisateur_id: data.utilisateur_id,
        reference_type: data.reference_type,
        reference_id: data.reference_id,
        type: data.type,
        titre: data.titre,
        date_creation: { gte: fenetre },
      },
    });
    if (existante) return null;

    return this.prisma.notification.create({
      data: {
        titre: data.titre,
        message: data.message,
        type: data.type,
        priorite: data.priorite || PrioriteNotification.MOYENNE,
        utilisateur_id: data.utilisateur_id,
        reference_type: data.reference_type,
        reference_id: data.reference_id,
      },
    });
  }

  async findAll(query: QueryNotificationDto, utilisateurId: string) {
    const { page = 1, limit = 20, type, priorite, est_lue } = query;
    const where: any = { utilisateur_id: utilisateurId };
    if (type) where.type = type;
    if (priorite) where.priorite = priorite;
    if (est_lue !== undefined) where.est_lue = est_lue;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date_creation: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async compterNonLues(utilisateurId: string): Promise<{ total: number }> {
    const total = await this.prisma.notification.count({
      where: { utilisateur_id: utilisateurId, est_lue: false },
    });
    return { total };
  }

  async marquerLue(id: string, utilisateurId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.utilisateur_id !== utilisateurId) {
      throw new NotFoundException('Notification non trouvee');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { est_lue: true },
    });
  }

  async toutMarquerLu(utilisateurId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { utilisateur_id: utilisateurId, est_lue: false },
      data: { est_lue: true },
    });
    return { count: result.count };
  }

  async trouverUtilisateursPresidence(): Promise<string[]> {
    const users = await this.prisma.utilisateur.findMany({
      where: { role: Role.PRESIDENCE, actif: true },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async trouverUtilisateursEtablissement(etablissementId: string): Promise<string[]> {
    const users = await this.prisma.utilisateur.findMany({
      where: {
        etablissement_id: etablissementId,
        actif: true,
        role: Role.ETABLISSEMENT,
      },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }
}