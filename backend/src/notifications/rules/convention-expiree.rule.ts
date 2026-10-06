import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { Convention } from '../../conventions/entities/convention.entity';
import { Projet } from '../../projets/entities/projet.entity';
import { NotificationsService } from '../notifications.service';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';
import { StatutConvention } from '../../common/enums/statut-convention.enum';
import { NotificationRule } from './notification-rule.interface';

@Injectable()
export class ConventionExpireeRule implements NotificationRule {
  constructor(
    @InjectRepository(Convention) private conventionRepo: Repository<Convention>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    private notificationsService: NotificationsService,
  ) {}

  async verifier(): Promise<void> {
    const maintenant = new Date();
    const conventions = await this.conventionRepo.find({
      where: {
        archive: false,
        statut: Not(StatutConvention.EXPIREE),
        date_fin: LessThan(maintenant),
      },
    });

    for (const convention of conventions) {
      await this.conventionRepo.update(convention.id, { statut: StatutConvention.EXPIREE });

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
        const projet = await this.projetRepo.findOne({
          where: { id: convention.projet_id },
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