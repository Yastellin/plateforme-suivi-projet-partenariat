// src/features/partenaires/components/ContactDialog.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, Mail, Save, TriangleAlert, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PhoneInputSanitized } from '@/components/forms/inputs/PhoneInputSanitized';
import { contactSchema, type ContactFormValues } from '@/lib/validators/contact.schema';
import { useRechercheDoublonContact } from '../api/useRechercheDoublonContact';
import { useDebounce } from '@/hooks/useDebounce';
import type { Contact } from '@/types/api';

interface ContactDialogProps {
  ouvert: boolean;
  onFermer: () => void;
  onSoumettre: (valeurs: ContactFormValues) => void;
  enCours: boolean;
  partenaireId: string;
  contact?: Contact;
}

function valeursInitiales(contact?: Contact): ContactFormValues {
  return {
    prenom: contact?.prenom ?? '',
    nom: contact?.nom ?? '',
    fonction: contact?.fonction ?? '',
    email: contact?.email ?? '',
    telephone: contact?.telephone ?? '',
  };
}

export function ContactDialog({ ouvert, onFermer, onSoumettre, enCours, partenaireId, contact }: ContactDialogProps) {
  const [confirmationPerte, setConfirmationPerte] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: valeursInitiales(contact),
  });

  useEffect(() => {
    if (ouvert) {
      reset(valeursInitiales(contact));
    }
  }, [ouvert, contact, reset]);

  const email = watch('email') ?? '';
  const emailDifferee = useDebounce(email, 400);
  const { data: doublonsEmail } = useRechercheDoublonContact(partenaireId, 'email', emailDifferee);
  const doublonEmail = doublonsEmail?.find((d) => d.id !== contact?.id);

  function tenterFermeture() {
    if (isDirty) {
      setConfirmationPerte(true);
      return;
    }
    onFermer();
  }

  function confirmerAbandon() {
    setConfirmationPerte(false);
    onFermer();
  }

  return (
    <>
      <Dialog open={ouvert} onOpenChange={(valeur) => !valeur && tenterFermeture()}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{contact ? 'Modifier le contact' : 'Nouveau contact'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSoumettre)} noValidate className="pt-2">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FloatingLabelInput
                label="Prénom"
                requis
                autoFocus
                icone={<User />}
                placeholder="Ex : Marie"
                erreur={errors.prenom?.message}
                {...register('prenom')}
              />
              <FloatingLabelInput
                label="Nom"
                requis
                icone={<User />}
                placeholder="Ex : Rakoto"
                erreur={errors.nom?.message}
                {...register('nom')}
              />
            </div>

            <FloatingLabelInput
              label="Fonction"
              icone={<Briefcase />}
              placeholder="Ex : Directeur des partenariats"
              erreur={errors.fonction?.message}
              {...register('fonction')}
            />

            <FloatingLabelInput
              label="Adresse e-mail"
              type="email"
              icone={<Mail />}
              placeholder="prenom.nom@exemple.mg"
              erreur={errors.email?.message}
              {...register('email')}
            />
            {doublonEmail ? (
              <div className="mb-4 -mt-2.5 flex items-center gap-2 px-0.5 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                Un contact avec cet e-mail existe déjà pour ce partenaire.
              </div>
            ) : null}

            <PhoneInputSanitized erreur={errors.telephone?.message} {...register('telephone')} />

            <div className="mt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={tenterFermeture}
                disabled={enCours}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours || Boolean(doublonEmail)}
                className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        ouvert={confirmationPerte}
        onFermer={() => setConfirmationPerte(false)}
        onConfirmer={confirmerAbandon}
        titre="Abandonner la saisie"
        description="Les informations saisies ne seront pas enregistrées."
        libelleAction="Abandonner"
        libelleAnnulation="Continuer la saisie"
      />
    </>
  );
}