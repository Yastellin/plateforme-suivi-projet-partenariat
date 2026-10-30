// src/features/partenaires/components/ContactDialog.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, Mail, Plus, Save, TriangleAlert, User, X } from 'lucide-react';
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
import { useRechercheDoublonContact, useRechercheDoublonsContact } from '../api/useRechercheDoublonContact';
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
    nom: contact?.nom ?? '',
    fonction: contact?.fonction ?? '',
    email: contact?.email ?? contact?.emails?.[0] ?? '',
    emails: (contact?.emails ?? []).filter((email) => email !== contact?.email),
    telephone: contact?.telephone ?? contact?.telephones?.[0] ?? '',
    telephones: (contact?.telephones ?? []).filter((telephone) => telephone !== contact?.telephone),
  };
}

export function ContactDialog({ ouvert, onFermer, onSoumettre, enCours, partenaireId, contact }: ContactDialogProps) {
  const [confirmationPerte, setConfirmationPerte] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
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
  const emailsSupplementaires = watch('emails') ?? [];
  const telephone = watch('telephone') ?? '';
  const telephonesSupplementaires = watch('telephones') ?? [];
  const emailDifferee = useDebounce(email, 400);
  const telephoneDiffere = useDebounce(telephone, 400);
  const emailsSupplementairesDifferes = useDebounce(emailsSupplementaires, 400);
  const telephonesSupplementairesDifferes = useDebounce(telephonesSupplementaires, 400);
  const { data: doublonsEmail } = useRechercheDoublonContact(partenaireId, 'email', emailDifferee);
  const { data: doublonsTelephone } = useRechercheDoublonContact(partenaireId, 'telephone', telephoneDiffere);
  const { data: doublonsSupplementaires } = useRechercheDoublonsContact(
    partenaireId,
    emailsSupplementairesDifferes,
    telephonesSupplementairesDifferes,
  );
  const doublonEmail = doublonsEmail?.find((doublon) => doublon.proprietaire_id !== contact?.id);
  const doublonTelephone = doublonsTelephone?.find((doublon) => doublon.proprietaire_id !== contact?.id);
  const doublonSupplementaire = doublonsSupplementaires.find((doublon) => doublon.proprietaire_id !== contact?.id);

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

          <form
            onSubmit={handleSubmit((valeurs) => onSoumettre({
              ...valeurs,
              emails: valeurs.emails?.map((item) => item.trim()).filter(Boolean),
              telephones: valeurs.telephones?.map((item) => item.trim()).filter(Boolean),
            }))}
            noValidate
            className="pt-2"
          >
            <FloatingLabelInput
              label="Nom complet"
              requis
              autoFocus
              icone={<User />}
              placeholder="Ex : Rakoto Soa"
              caracteresInterdits={/[^\p{L}\p{M}\s'-]/gu}
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
              placeholder="prenom.nom@univ-fianarantsoa.mg"
              erreur={errors.email?.message}
              {...register('email')}
            />
            {doublonEmail ? (
              <div className="mb-4 -mt-2.5 flex items-center gap-2 px-0.5 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                Cet e-mail appartient déjà à {doublonEmail.proprietaire_nom} ({doublonEmail.proprietaire_type === 'CONTACT' ? 'contact' : 'partenaire'}).
              </div>
            ) : null}
            {emailsSupplementaires.map((_, index) => (
              <div key={`email-${index}`} className="mb-3 flex items-start gap-2">
                <div className="flex-1">
                  <FloatingLabelInput
                    label={`Adresse e-mail ${index + 2}`}
                    type="email"
                    placeholder="autre.adresse@univ-fianarantsoa.mg"
                    erreur={errors.emails?.[index]?.message}
                    {...register(`emails.${index}`)}
                  />
                </div>
                <button type="button" className="mt-2 rounded p-2 text-[var(--color-text-secondary)] hover:text-destructive" aria-label={`Retirer l'adresse e-mail ${index + 2}`} onClick={() => setValue('emails', emailsSupplementaires.filter((__, position) => position !== index), { shouldDirty: true, shouldValidate: true })}><X className="h-4 w-4" /></button>
              </div>
            ))}
            {emailsSupplementaires.length < 9 ? (
              <button type="button" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)]" onClick={() => setValue('emails', [...emailsSupplementaires, ''], { shouldDirty: true })}><Plus className="h-3.5 w-3.5" /> Ajouter une adresse e-mail</button>
            ) : null}

            <PhoneInputSanitized erreur={errors.telephone?.message} {...register('telephone')} />
            {doublonTelephone ? (
              <div className="mb-4 -mt-2.5 flex items-center gap-2 px-0.5 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                Ce numéro appartient déjà à {doublonTelephone.proprietaire_nom} ({doublonTelephone.proprietaire_type === 'CONTACT' ? 'contact' : 'partenaire'}).
              </div>
            ) : null}
            {telephonesSupplementaires.map((_, index) => (
              <div key={`telephone-${index}`} className="mb-3 flex items-start gap-2">
                <div className="flex-1">
                  <PhoneInputSanitized erreur={errors.telephones?.[index]?.message} {...register(`telephones.${index}`)} />
                </div>
                <button type="button" className="mt-2 rounded p-2 text-[var(--color-text-secondary)] hover:text-destructive" aria-label={`Retirer le numéro ${index + 2}`} onClick={() => setValue('telephones', telephonesSupplementaires.filter((__, position) => position !== index), { shouldDirty: true, shouldValidate: true })}><X className="h-4 w-4" /></button>
              </div>
            ))}
            {telephonesSupplementaires.length < 9 ? (
              <button type="button" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)]" onClick={() => setValue('telephones', [...telephonesSupplementaires, ''], { shouldDirty: true })}><Plus className="h-3.5 w-3.5" /> Ajouter un numéro</button>
            ) : null}
            {doublonSupplementaire ? (
              <div className="mb-4 flex items-center gap-2 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                Une coordonnée additionnelle appartient déjà à {doublonSupplementaire.proprietaire_nom}.
              </div>
            ) : null}

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
                disabled={enCours || !isValid || Boolean(doublonEmail) || Boolean(doublonTelephone) || Boolean(doublonSupplementaire)}
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