import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';
import { TypeNotification, PrioriteNotification, StatutProjet } from '@prisma/client';
import { NotificationRule } from './notification-rule.interface';

@Injectable()
export class ProjetRetardRule implements NotificationRule {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async verifier(): Promise<void> {
    const maintenant = new Date();
    const projets = await this.prisma.projet.findMany({
      where: {
        archive: false,
        statut: {
          notIn: [StatutProjet.BROUILLON, StatutProjet.TERMINE, StatutProjet.EXPIRE],
        },
        date_fin_prevue: { lt: maintenant },
      },
    });

    for (const projet of projets) {
      const titre = `Projet en retard : ${projet.nom}`;
      const message = `Le projet "${projet.nom}" a depasse sa date de fin prevue le ${projet.date_fin_prevue.toLocaleDateString('fr-FR')}.`;

      const presidenceUsers = await this.notificationsService.trouverUtilisateursPresidence();
      for (const userId of presidenceUsers) {
        await this.notificationsService.creer({
          titre,
          message,
          type: TypeNotification.PROJET_RETARD,
          priorite: PrioriteNotification.HAUTE,
          utilisateur_id: userId,
          reference_type: 'Projet',
          reference_id: projet.id,
          fenetreDedupJours: 7,
        });
      }

      const etabUsers = await this.notificationsService.trouverUtilisateursEtablissement(
        projet.etablissement_id,
      );
      for (const userId of etabUsers) {
        await this.notificationsService.creer({
          titre,
          message,
          type: TypeNotification.PROJET_RETARD,
          priorite: PrioriteNotification.MOYENNE,
          utilisateur_id: userId,
          reference_type: 'Projet',
          reference_id: projet.id,
          fenetreDedupJours: 7,
        });
      }
    }
  }
}