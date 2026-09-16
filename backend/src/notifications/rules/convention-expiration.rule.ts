import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';
import { TypeNotification, PrioriteNotification, StatutConvention } from '@prisma/client';
import { NotificationRule } from '../rules/notification-rule.interface';

const SEUILS_JOURS = [30, 15, 7];

@Injectable()
export class ConventionExpirationRule implements NotificationRule {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async verifier(): Promise<void> {
    const maintenant = new Date();
    const dans30Jours = new Date(maintenant.getTime() + 30 * 24 * 60 * 60 * 1000);

    const conventions = await this.prisma.convention.findMany({
      where: {
        archive: false,
        statut: { in: [StatutConvention.SIGNEE, StatutConvention.ACTIVE] },
        date_fin: { gte: maintenant, lte: dans30Jours },
      },
    });

    for (const convention of conventions) {
      if (!convention.date_fin) continue;

      const joursRestants = Math.ceil(
        (convention.date_fin.getTime() - maintenant.getTime()) / (24 * 60 * 60 * 1000),
      );

      const seuilsTries = [...SEUILS_JOURS].sort((a, b) => a - b);
      for (const seuil of seuilsTries) {
        if (joursRestants <= seuil) {
          await this.genererNotifications(convention, seuil);
          break;
        }
      }
    }
  }

  private async genererNotifications(convention: any, seuil: number): Promise<void> {
    const titre = `Convention bientot expiree (${seuil} jours)`;
    const message = `La convention ${convention.reference} (${convention.titre}) arrivera a expiration dans ${seuil} jours.`;

    // Notifier la Presidence (dedup etendue a 30 jours pour eviter le spam)
    const presidenceUsers = await this.notificationsService.trouverUtilisateursPresidence();
    for (const userId of presidenceUsers) {
      await this.notificationsService.creer({
        titre,
        message,
        type: TypeNotification.EXPIRATION_CONVENTION,
        priorite: PrioriteNotification.HAUTE,
        utilisateur_id: userId,
        reference_type: 'Convention',
        reference_id: convention.id,
        fenetreDedupJours: 30,
      });
    }

    // Notifier l'Etablissement proprietaire si la convention est liee a un projet
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
            type: TypeNotification.EXPIRATION_CONVENTION,
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