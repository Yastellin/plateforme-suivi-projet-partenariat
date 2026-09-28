// src/features/partenaires/components/ContactsSection.tsx

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react';
import { ContactDialog } from './ContactDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCreateContact, useDeleteContact, useUpdateContact } from '../api/useContacts';
import type { Contact } from '@/types/api';
import type { ContactFormValues } from '@/lib/validators/partenaire.schema';

interface ContactsSectionProps {
  partenaireId: string;
  contacts: Contact[];
  peutGerer: boolean;
}

export function ContactsSection({ partenaireId, contacts, peutGerer }: ContactsSectionProps) {
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [contactEdite, setContactEdite] = useState<Contact | undefined>(undefined);
  const [contactASupprimer, setContactASupprimer] = useState<Contact | null>(null);

  const { mutate: creer, isPending: creationEnCours } = useCreateContact();
  const { mutate: modifier, isPending: modificationEnCours } = useUpdateContact();
  const { mutate: supprimer, isPending: suppressionEnCours } = useDeleteContact();

  function ouvrirCreation() {
    setContactEdite(undefined);
    setDialogueOuvert(true);
  }

  function ouvrirEdition(contact: Contact) {
    setContactEdite(contact);
    setDialogueOuvert(true);
  }

  function fermerDialogue() {
    setDialogueOuvert(false);
    setContactEdite(undefined);
  }

  function onSoumettre(valeurs: ContactFormValues) {
    if (contactEdite) {
      modifier(
        { id: contactEdite.id, partenaireId, valeurs },
        {
          onSuccess: () => {
            toast.success('Contact mis à jour');
            fermerDialogue();
          },
          onError: (erreur) => toast.error(erreur.message),
        },
      );
      return;
    }

    creer(
      { partenaireId, valeurs },
      {
        onSuccess: () => {
          toast.success('Contact ajouté');
          fermerDialogue();
        },
        onError: (erreur) => toast.error(erreur.message),
      },
    );
  }

  function onConfirmerSuppression() {
    if (!contactASupprimer) {
      return;
    }
    supprimer(
      { id: contactASupprimer.id, partenaireId },
      {
        onSuccess: () => {
          toast.success('Contact supprimé');
          setContactASupprimer(null);
        },
        onError: (erreur) => toast.error(erreur.message),
      },
    );
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-[15px] font-bold">Contacts</h3>
        {peutGerer && contacts.length > 0 ? (
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        ) : null}
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icone={Users}
          titre="Aucun contact enregistré"
          description="Les personnes référentes de ce partenaire apparaîtront ici."
          action={
            peutGerer ? (
              <button
                type="button"
                onClick={ouvrirCreation}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter un contact
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{contact.nom}</p>
                {contact.fonction ? (
                  <p className="text-xs text-[var(--color-text-secondary)]">{contact.fonction}</p>
                ) : null}
                <div className="mt-1.5 flex flex-col gap-1 text-xs text-[var(--color-text-secondary)]">
                  {contact.email ? (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </span>
                  ) : null}
                  {contact.telephone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {contact.telephone}
                    </span>
                  ) : null}
                </div>
              </div>

              {peutGerer ? (
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => ouvrirEdition(contact)}
                    aria-label={`Modifier ${contact.nom}`}
                    className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactASupprimer(contact)}
                    aria-label={`Supprimer ${contact.nom}`}
                    className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--status-expire-bg)] hover:text-[var(--status-expire-fg)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {peutGerer ? (
        <>
          <ContactDialog
            ouvert={dialogueOuvert}
            onFermer={fermerDialogue}
            onSoumettre={onSoumettre}
            enCours={creationEnCours || modificationEnCours}
            contact={contactEdite}
          />

          <ConfirmDialog
            ouvert={contactASupprimer !== null}
            onFermer={() => setContactASupprimer(null)}
            onConfirmer={onConfirmerSuppression}
            titre="Supprimer ce contact"
            description={`Le contact « ${contactASupprimer?.nom ?? ''} » sera retiré de la fiche du partenaire.`}
            libelleAction="Supprimer"
            enCours={suppressionEnCours}
          />
        </>
      ) : null}
    </section>
  );
}