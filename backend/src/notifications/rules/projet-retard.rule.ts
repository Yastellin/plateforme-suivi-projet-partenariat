import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, In, Repository } from 'typeorm';
import { Projet } from '../../projets/entities/projet.entity';
import { NotificationsService } from '../notifications.service';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';
import { StatutProjet } from '../../common/enums/statut-projet.enum';
import { NotificationRule } from './notification-rule.interface';

@Injectable()
export class ProjetRetardRule implements NotificationRule {
  constructor(
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    private notificationsService: NotificationsService,
  ) {}

  async verifier(): Promise<void> {
    const maintenant = new Date();
    const projets = await this.projetRepo.find({
      where: {
        archive: false,
        statut: Not(In([StatutProjet.BROUILLON, StatutProjet.TERMINE, StatutProjet.EXPIRE])),
        date_fin_prevue: LessThan(maintenant),
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