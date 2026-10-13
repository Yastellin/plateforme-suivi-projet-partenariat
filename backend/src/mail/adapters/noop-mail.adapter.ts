import { Injectable, Logger } from '@nestjs/common';
import type { MailMessage, MailPort } from '../mail.port';

// Adapter de developpement : journalise le message sans l'envoyer.
// Utilise pour ne pas dependre d'un serveur SMTP en local ou en CI.
@Injectable()
export class NoopMailAdapter implements MailPort {
  private readonly logger = new Logger(NoopMailAdapter.name);

  envoyer(message: MailMessage): Promise<void> {
    this.logger.log(
      `[NOOP MAIL] destinataire=${message.destinataire} sujet="${message.sujet}"`,
    );
    // Le contenu est logue au meme niveau pour permettre la recuperation
    // du lien de reinitialisation en developpement.
    this.logger.log(message.contenu_texte ?? message.contenu_html);
    return Promise.resolve();
  }
}
