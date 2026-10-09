export const MAIL_PORT = 'MAIL_PORT';

export interface MailMessage {
  destinataire: string;
  sujet: string;
  contenu_html: string;
  contenu_texte?: string;
}

export interface MailPort {
  envoyer(message: MailMessage): Promise<void>;
}