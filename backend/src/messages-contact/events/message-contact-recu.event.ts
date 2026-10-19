export const MESSAGE_CONTACT_RECU = 'message-contact.recu';

// Publie apres l'enregistrement d'un message du formulaire public.
export interface MessageContactRecuEvent {
  messageId: string;
  reference: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string;
  etablissementId: string | null;
}
