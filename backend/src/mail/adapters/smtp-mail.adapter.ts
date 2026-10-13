import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { MailMessage, MailPort } from '../mail.port';

@Injectable()
export class SmtpMailAdapter implements MailPort {
  private readonly logger = new Logger(SmtpMailAdapter.name);
  private readonly transporteur: Transporter;
  private readonly expediteur: string;

  constructor(private readonly config: ConfigService) {
    this.expediteur = this.config.getOrThrow<string>('SMTP_FROM');

    // ConfigService renvoie les variables d environnement sous forme de chaines.
    // Sans conversion explicite, `port === 465` comparait "465" a 465 : toujours
    // faux, si bien que le TLS implicite n etait jamais active sur le port 465.
    const port = Number(this.config.getOrThrow<string>('SMTP_PORT'));

    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(
        `SMTP_PORT invalide : "${this.config.get<string>('SMTP_PORT')}" (un nombre est attendu).`,
      );
    }

    this.transporteur = createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  async envoyer(message: MailMessage): Promise<void> {
    try {
      await this.transporteur.sendMail({
        from: this.expediteur,
        to: message.destinataire,
        subject: message.sujet,
        text: message.contenu_texte,
        html: message.contenu_html,
      });
      this.logger.log(`E-mail envoye a ${message.destinataire}`);
    } catch (erreur) {
      // On ne propage pas l'erreur au client : un echec SMTP ne doit pas
      // reveler l'existence du compte (regle anti-enumeration).
      this.logger.error(
        `Echec envoi e-mail a ${message.destinataire}`,
        erreur instanceof Error ? erreur.stack : String(erreur),
      );
    }
  }
}
