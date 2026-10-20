import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';

@Injectable()
export class SoumissionListener {
  constructor(private notificationsService: NotificationsService) {}

  @OnEvent('projet.soumis')
  async onProjetSoumis(payload: any): Promise<void> {
    await this.notifierPresidence(
      payload,
      TypeNotification.PROJET_SOUMIS,
      'Projet',
    );
  }

  @OnEvent('partenariat.soumis')
  async onPartenariatSoumis(payload: any): Promise<void> {
    await this.notifierPresidence(
      payload,
      TypeNotification.PARTENARIAT_SOUMIS,
      'Partenariat',
    );
  }

  @OnEvent('partenaire.soumis')
  async onPartenaireSoumis(payload: any): Promise<void> {
    await this.notifierPresidence(
      payload,
      TypeNotification.PARTENAIRE_SOUMIS,
      'Partenaire',
    );
  }

  private async notifierPresidence(
    payload: any,
    typeDefaut: TypeNotification,
    refDefaut: string,
  ): Promise<void> {
    const presidenceUsers =
      await this.notificationsService.trouverUtilisateursPresidence();
    for (const userId of presidenceUsers) {
      await this.notificationsService.creer({
        titre: payload.titre || 'Nouvelle information',
        message: payload.message || '',
        type: payload.type || typeDefaut,
        priorite: payload.priorite || PrioriteNotification.HAUTE,
        utilisateur_id: userId,
        reference_type: payload.reference_type || refDefaut,
        reference_id: payload.reference_id,
      });
    }
  }
}
