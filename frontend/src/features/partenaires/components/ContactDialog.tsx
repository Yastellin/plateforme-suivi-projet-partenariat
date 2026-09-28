// src/features/partenaires/components/ContactDialog.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Mail, User, Briefcase } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PhoneInputSanitized } from '@/components/forms/inputs/PhoneInputSanitized';
import { contactSchema, type ContactFormValues } from '@/lib/validators/partenaire.schema';
import type { Contact } from '@/types/api';

interface ContactDialogProps {
  ouvert: boolean;
  onFermer: () => void;
  onSoumettre: (valeurs: ContactFormValues) => void;
  enCours: boolean;
  contact?: Contact;
}

function valeursInitiales(contact?: Contact): ContactFormValues {
  return {
    nom: contact?.nom ?? '',
    fonction: contact?.fonction ?? '',
    email: contact?.email ?? '',
    telephone: contact?.telephone ?? '',
  };
}

export function ContactDialog({ ouvert, onFermer, onSoumettre, enCours, contact }: ContactDialogProps) {
  const [confirmationPerte, setConfirmationPerte] = useState(false);

  const {
    register,
    handleSubmit,
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
            <FloatingLabelInput
              label="Nom"
              autoFocus
              icone={<User />}
              placeholder="Ex : Rakoto Andriamihaja"
              erreur={errors.nom?.message}
              {...register('nom')}
            />
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
                disabled={enCours}
                className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-70"
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