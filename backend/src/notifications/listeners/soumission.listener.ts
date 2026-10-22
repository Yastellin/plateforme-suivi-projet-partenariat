import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';

@Injectable()
export class SoumissionListener {
  private readonly logger = new Logger(SoumissionListener.name);

  constructor(private notificationsService: NotificationsService) {}

  @OnEvent('projet.soumis')
  onProjetSoumis(payload: any): Promise<void> {
    return this.notifierAvecGestion(
      payload,
      TypeNotification.PROJET_SOUMIS,
      'Projet',
    );
  }

  @OnEvent('partenariat.soumis')
  onPartenariatSoumis(payload: any): Promise<void> {
    return this.notifierAvecGestion(
      payload,
      TypeNotification.PARTENARIAT_SOUMIS,
      'Partenariat',
    );
  }

  @OnEvent('partenaire.soumis')
  onPartenaireSoumis(payload: any): Promise<void> {
    return this.notifierAvecGestion(
      payload,
      TypeNotification.PARTENAIRE_SOUMIS,
      'Partenaire',
    );
  }

  private async notifierAvecGestion(
    payload: any,
    typeDefaut: TypeNotification,
    refDefaut: string,
  ): Promise<void> {
    try {
      await this.notifierPresidence(payload, typeDefaut, refDefaut);
    } catch (erreur) {
      // La donnée est déjà soumise : un incident de notification est journalisé
      // mais ne transforme pas une soumission réussie en erreur HTTP.
      this.logger.error(
        `Échec de la notification de soumission ${payload.reference_id ?? ''}`,
        erreur instanceof Error ? erreur.stack : String(erreur),
      );
    }
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
