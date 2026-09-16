import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';
import { TypeNotification, PrioriteNotification, StatutConvention } from '@prisma/client';
import { NotificationRule } from './notification-rule.interface';

@Injectable()
export class ConventionExpireeRule implements NotificationRule {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async verifier(): Promise<void> {
    const maintenant = new Date();
    const conventions = await this.prisma.convention.findMany({
      where: {
        archive: false,
        statut: { not: StatutConvention.EXPIREE },
        date_fin: { lt: maintenant },
      },
    });

    for (const convention of conventions) {
      await this.prisma.convention.update({
        where: { id: convention.id },
        data: { statut: StatutConvention.EXPIREE },
      });

      const titre = `Convention expiree : ${convention.reference}`;
      const message = `La convention ${convention.reference} (${convention.titre}) a expire.`;

      const presidenceUsers = await this.notificationsService.trouverUtilisateursPresidence();
      for (const userId of presidenceUsers) {
        await this.notificationsService.creer({
          titre,
          message,
          type: TypeNotification.CONVENTION_EXPIREE,
          priorite: PrioriteNotification.HAUTE,
          utilisateur_id: userId,
          reference_type: 'Convention',
          reference_id: convention.id,
          fenetreDedupJours: 30,
        });
      }

      if (convention.projet_id) {
        const projet = await this.prisma.projet.findUnique({
          where: { id: convention.projet_id },
          select: { etablissement_id: true },
        });
        if (projet) {
          const etabUsers = await this.notificationsService.trouverUtilisateursEtablissement(
            projet.etablissement_id,
          );
          for (const userId of etabUsers) {
            await this.notificationsService.creer({
              titre,
              message,
              type: TypeNotification.CONVENTION_EXPIREE,
              priorite: PrioriteNotification.HAUTE,
              utilisateur_id: userId,
              reference_type: 'Convention',
              reference_id: convention.id,
              fenetreDedupJours: 30,
            });
          }
        }
      }
    }
  }
}