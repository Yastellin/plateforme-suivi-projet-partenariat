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
    this.transporteur = createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port: this.config.getOrThrow<number>('SMTP_PORT'),
      secure: this.config.get<number>('SMTP_PORT') === 465,
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