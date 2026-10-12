import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MAIL_PORT, type MailPort } from '../../mail/mail.port';
import {
  MotDePasseModifieEvent,
  MOT_DE_PASSE_MODIFIE,
} from '../events/mot-de-passe-modifie.event';

@Injectable()
export class MotDePasseModifieListener {
  private readonly logger = new Logger(MotDePasseModifieListener.name);

  constructor(@Inject(MAIL_PORT) private readonly mail: MailPort) {}

  @OnEvent(MOT_DE_PASSE_MODIFIE, { async: true })
  async gerer(event: MotDePasseModifieEvent): Promise<void> {
    const sujet = 'Votre mot de passe a ete modifie';
    const texte =
      'Votre mot de passe vient d etre modifie. ' +
      'Si vous n etes pas a l origine de cette action, contactez immediatement l administration.';
    const html = `<p>${texte}</p>`;

    try {
      await this.mail.envoyer({
        destinataire: event.email,
        sujet,
        contenu_texte: texte,
        contenu_html: html,
      });
    } catch (erreur) {
      // Un echec d envoi ne doit jamais faire echouer la reinitialisation.
      this.logger.error(
        `Echec de notification a ${event.email}`,
        erreur instanceof Error ? erreur.stack : String(erreur),
      );
    }
  }
}
