import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from '../../auth/entities/utilisateur.entity';
import { Role } from '../../common/enums/role.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { MAIL_PORT, type MailPort } from '../../mail/mail.port';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  MESSAGE_CONTACT_RECU,
  type MessageContactRecuEvent,
} from '../events/message-contact-recu.event';

const echapper = (valeur: string) =>
  valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Notifie les destinataires d'un message de contact : notification dans
// l'espace interne + e-mail. Destinataires :
//  - message pour un etablissement : ses utilisateurs actifs ;
//  - message general : les utilisateurs actifs de la Presidence.
// Le DECIDEUR n'est jamais destinataire des messages de contact.
@Injectable()
export class MessageContactRecuListener implements BeforeApplicationShutdown {
  private readonly logger = new Logger(MessageContactRecuListener.name);
  private readonly travauxEnCours = new Set<Promise<void>>();

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepo: Repository<Utilisateur>,
    @Inject(MAIL_PORT) private readonly mail: MailPort,
  ) {}

  @OnEvent(MESSAGE_CONTACT_RECU)
  gerer(event: MessageContactRecuEvent): void {
    // Le traitement reste non bloquant pour la requête HTTP, mais chaque
    // promesse est suivie afin que Nest puisse la drainer avant de fermer la
    // connexion à la base de données.
    const travail = this.traiter(event).finally(() => {
      this.travauxEnCours.delete(travail);
    });
    this.travauxEnCours.add(travail);
  }

  async beforeApplicationShutdown(): Promise<void> {
    await Promise.allSettled([...this.travauxEnCours]);
  }

  private async traiter(event: MessageContactRecuEvent): Promise<void> {
    try {
      const destinataires = await this.trouverDestinataires(event);
      for (const destinataire of destinataires) {
        await this.notifier(destinataire, event);
        await this.envoyerEmail(destinataire, event);
      }
    } catch (erreur) {
      // Un échec de notification ne doit jamais impacter l'envoi du message.
      this.logger.error(
        `Échec de la notification du message ${event.messageId}`,
        erreur instanceof Error ? erreur.stack : String(erreur),
      );
    }
  }

  private trouverDestinataires(
    event: MessageContactRecuEvent,
  ): Promise<Utilisateur[]> {
    if (event.etablissementId) {
      return this.utilisateurRepo.find({
        where: {
          role: Role.ETABLISSEMENT,
          etablissement_id: event.etablissementId,
          actif: true,
        },
      });
    }
    return this.utilisateurRepo.find({
      where: { role: Role.PRESIDENCE, actif: true },
    });
  }

  private async notifier(
    destinataire: Utilisateur,
    event: MessageContactRecuEvent,
  ) {
    try {
      await this.notificationsService.creer({
        titre: 'Nouveau message de contact',
        message: `${event.reference} : ${event.nom} — ${event.sujet}`,
        type: TypeNotification.MESSAGE_CONTACT,
        priorite: PrioriteNotification.HAUTE,
        utilisateur_id: destinataire.id,
        reference_type: 'MessageContact',
        reference_id: event.messageId,
      });
    } catch (erreur) {
      this.logger.error(
        `Notification non creee pour ${destinataire.id}`,
        erreur instanceof Error ? erreur.stack : String(erreur),
      );
    }
  }

  private async envoyerEmail(
    destinataire: Utilisateur,
    event: MessageContactRecuEvent,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const cheminInterne =
      destinataire.role === Role.ETABLISSEMENT
        ? '/etablissement/messages'
        : '/presidence/messages';
    const lien = `${frontendUrl}${cheminInterne}`;

    // Le contenu du message n'est pas envoye par e-mail : il se lit dans l'espace interne.
    const lignes = [
      'Un nouveau message a été reçu via le formulaire de contact.',
      '',
      `Référence : ${event.reference}`,
      `Expéditeur : ${event.nom}`,
      `E-mail : ${event.email}`,
      ...(event.telephone ? [`Téléphone : ${event.telephone}`] : []),
      `Sujet : ${event.sujet}`,
      '',
      `Pour lire le message et le traiter, connectez-vous à la plateforme : ${lien}`,
    ];
    const texte = lignes.join('\n');
    const html =
      '<p>Un nouveau message a été reçu via le formulaire de contact.</p>' +
      '<ul>' +
      `<li><strong>Référence :</strong> ${echapper(event.reference)}</li>` +
      `<li><strong>Expéditeur :</strong> ${echapper(event.nom)}</li>` +
      `<li><strong>E-mail :</strong> ${echapper(event.email)}</li>` +
      (event.telephone
        ? `<li><strong>Téléphone :</strong> ${echapper(event.telephone)}</li>`
        : '') +
      `<li><strong>Sujet :</strong> ${echapper(event.sujet)}</li>` +
      '</ul>' +
      `<p>Pour lire le message et le traiter, <a href="${lien}">connectez-vous à la plateforme</a>.</p>`;

    try {
      await this.mail.envoyer({
        destinataire: destinataire.email,
        // Pas de retour a la ligne dans un en-tete d'e-mail.
        sujet:
          `Nouveau message de contact ${event.reference} : ${event.sujet}`.replace(
            /[\r\n]+/g,
            ' ',
          ),
        contenu_texte: texte,
        contenu_html: html,
      });
    } catch (erreur) {
      this.logger.error(
        `E-mail non envoyé à ${destinataire.email}`,
        erreur instanceof Error ? erreur.stack : String(erreur),
      );
    }
  }
}
