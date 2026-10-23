// src/features/partenaires/components/PartenaireForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save, TriangleAlert, X } from 'lucide-react';
import { creerSchemaPartenaire, type PartenaireFormValues } from '@/lib/validators/partenaire.schema';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PhoneInputSanitized } from '@/components/forms/inputs/PhoneInputSanitized';
import { useRechercheDoublon, useRechercheDoublonsPartenaireCoordonnees } from '../api/useRechercheDoublon';
import { useDebounce } from '@/hooks/useDebounce';
import type { Etablissement, Partenaire } from '@/types/api';

interface PartenaireFormProps {
  partenaire?: Partenaire;
  nomInitial?: string;
  etablissements?: Etablissement[];
  peutGererVisibilite?: boolean;
  onSoumettre: (valeurs: PartenaireFormValues) => void;
  enCours: boolean;
}

export function PartenaireForm({
  partenaire,
  nomInitial,
  etablissements,
  peutGererVisibilite = false,
  onSoumettre,
  enCours,
}: PartenaireFormProps) {
  const afficherSelectionEtablissement = etablissements !== undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PartenaireFormValues>({
    resolver: zodResolver(creerSchemaPartenaire(afficherSelectionEtablissement)),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nom: partenaire?.nom ?? nomInitial ?? '',
      type: partenaire?.type ?? '',
      pays: partenaire?.pays ?? '',
      adresse: partenaire?.adresse ?? '',
      telephone: partenaire?.telephone ?? partenaire?.telephones?.[0] ?? '',
      telephones: (partenaire?.telephones ?? []).filter((telephone) => telephone !== partenaire?.telephone),
      email: partenaire?.email ?? partenaire?.emails?.[0] ?? '',
      emails: (partenaire?.emails ?? []).filter((email) => email !== partenaire?.email),
      site_web: partenaire?.site_web ?? '',
      description: partenaire?.description ?? '',
      visibilite: partenaire?.visibilite ?? 'PRIVE',
      est_strategique: partenaire?.est_strategique ?? false,
      etablissement_id: partenaire?.etablissement_id ?? '',
    },
  });

  const nom = watch('nom') ?? '';
  const pays = watch('pays') ?? '';
  const type = watch('type') ?? '';
  const email = watch('email') ?? '';
  const emailsSupplementaires = watch('emails') ?? [];
  const telephone = watch('telephone') ?? '';
  const telephonesSupplementaires = watch('telephones') ?? [];
  const etablissementId = watch('etablissement_id') ?? partenaire?.etablissement_id ?? '';
  const nomDiffere = useDebounce(nom, 400);
  const emailDifferee = useDebounce(email, 400);
  const telephoneDiffere = useDebounce(telephone, 400);
  const emailsSupplementairesDifferes = useDebounce(emailsSupplementaires, 400);
  const telephonesSupplementairesDifferes = useDebounce(telephonesSupplementaires, 400);
  const nomPourRecherche = afficherSelectionEtablissement && !etablissementId ? '' : nomDiffere;
  const { data: doublonsIdentite } = useRechercheDoublon('nom', nomPourRecherche, {
    pays,
    type,
    etablissement_id: etablissementId || undefined,
  });
  const { data: doublonsEmail } = useRechercheDoublon('email', emailDifferee);
  const { data: doublonsTelephone } = useRechercheDoublon('telephone', telephoneDiffere);
  const { data: doublonsSupplementaires } = useRechercheDoublonsPartenaireCoordonnees(
    emailsSupplementairesDifferes,
    telephonesSupplementairesDifferes,
  );
  const listeDoublonsIdentite = Array.isArray(doublonsIdentite) ? doublonsIdentite : [];
  const listeDoublonsEmail = Array.isArray(doublonsEmail) ? doublonsEmail : [];
  const listeDoublonsTelephone = Array.isArray(doublonsTelephone) ? doublonsTelephone : [];
  const listeDoublonsSupplementaires = Array.isArray(doublonsSupplementaires) ? doublonsSupplementaires : [];
  const idProprietaire = (doublon: { id: string; proprietaire_id?: string }) => doublon.proprietaire_id ?? doublon.id;
  const doublonIdentite = listeDoublonsIdentite.find((doublon) =>
    idProprietaire(doublon) !== partenaire?.id &&
    'raisons_doublon' in doublon &&
    doublon.raisons_doublon?.includes('nom identique') &&
    doublon.raisons_doublon?.includes('pays identique'),
  );
  const doublonEmail = listeDoublonsEmail.find((doublon) => idProprietaire(doublon) !== partenaire?.id);
  const doublonTelephone = listeDoublonsTelephone.find((doublon) => idProprietaire(doublon) !== partenaire?.id);
  const doublonSupplementaire = listeDoublonsSupplementaires.find((doublon) => idProprietaire(doublon) !== partenaire?.id);

  return (
    <form
      onSubmit={handleSubmit((valeurs) => onSoumettre({
        ...valeurs,
        emails: valeurs.emails?.map((item) => item.trim()).filter(Boolean),
        telephones: valeurs.telephones?.map((item) => item.trim()).filter(Boolean),
      }))} noValidate className="flex flex-col gap-1">
      {afficherSelectionEtablissement ? (
        <div className="mb-4">
          <label htmlFor="etablissement_id" className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]">
            Établissement porteur <span className="text-[var(--status-expire-fg)]">*</span>
          </label>
          <select
            id="etablissement_id"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[13.5px] outline-none focus:border-[var(--color-brand)]"
            {...register('etablissement_id')}
          >
            <option value="">Sélectionnez un établissement</option>
            {etablissements?.map((etablissement) => (
              <option key={etablissement.id} value={etablissement.id}>
                {etablissement.nom}
              </option>
            ))}
          </select>
          {errors.etablissement_id ? (
            <p role="alert" className="mt-1 px-0.5 text-[11.5px] font-medium text-[var(--status-expire-fg)]">
              {errors.etablissement_id.message}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FloatingLabelInput
          label="Nom"
          requis
          autoFocus
          placeholder="Ex : Airtel Madagascar"
          aide="Doublon bloquant : même nom et même pays dans un établissement."
          erreur={errors.nom?.message}
          {...register('nom')}
        />
        <FloatingLabelInput
          label="Type"
          requis
          placeholder="Ex : Opérateur télécom, ONG, Université"
          erreur={errors.type?.message}
          {...register('type')}
        />
      </div>
      {doublonIdentite ? (
        <div className="mb-4 -mt-2 flex items-center gap-2 px-0.5 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          Une fiche avec le même nom et le même pays existe déjà dans cet établissement.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FloatingLabelInput
          label="Pays"
          requis
          placeholder="Ex : Madagascar"
          erreur={errors.pays?.message}
          {...register('pays')}
        />
        <FloatingLabelInput
          label="Adresse"
          placeholder="Ex : Lot II M 12, Antananarivo"
          erreur={errors.adresse?.message}
          {...register('adresse')}
        />
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div>
          <PhoneInputSanitized erreur={errors.telephone?.message} {...register('telephone')} />
          {doublonTelephone ? (
            <div className="mb-4 -mt-3 flex items-center gap-2 px-0.5 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              Ce numéro appartient déjà à une autre personne ou un autre partenaire.
            </div>
          ) : null}
        </div>
        <div>
          <FloatingLabelInput
            label="Adresse e-mail"
            type="email"
            placeholder="contact@exemple.mg"
            erreur={errors.email?.message}
            {...register('email')}
          />
          {doublonEmail ? (
            <div className="mb-4 -mt-3 flex items-center gap-2 px-0.5 text-[11.5px] font-medium text-[var(--status-attente-fg)]">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              Cet e-mail appartient déjà à une autre personne ou un autre partenaire.
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          {telephonesSupplementaires.map((_, index) => (
            <div key={`telephone-${index}`} className="flex items-start gap-2">
              <div className="flex-1"><PhoneInputSanitized erreur={errors.telephones?.[index]?.message} {...register(`telephones.${index}`)} /></div>
              <button type="button" className="mt-2 rounded p-2 text-[var(--color-text-secondary)] hover:text-destructive" aria-label={`Retirer le numéro ${index + 2}`} onClick={() => setValue('telephones', telephonesSupplementaires.filter((__, position) => position !== index), { shouldDirty: true, shouldValidate: true })}><X className="h-4 w-4" /></button>
            </div>
          ))}
          {telephonesSupplementaires.length < 9 ? <button type="button" className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[var(--color-brand)]" onClick={() => setValue('telephones', [...telephonesSupplementaires, ''], { shouldDirty: true })}><Plus className="h-3.5 w-3.5" /> Ajouter un numéro</button> : null}
        </div>
        <div className="flex flex-col gap-2">
          {emailsSupplementaires.map((_, index) => (
            <div key={`email-${index}`} className="flex items-start gap-2">
              <div className="flex-1"><FloatingLabelInput label={`Adresse e-mail ${index + 2}`} type="email" placeholder="autre.contact@exemple.mg" erreur={errors.emails?.[index]?.message} {...register(`emails.${index}`)} /></div>
              <button type="button" className="mt-2 rounded p-2 text-[var(--color-text-secondary)] hover:text-destructive" aria-label={`Retirer l'adresse e-mail ${index + 2}`} onClick={() => setValue('emails', emailsSupplementaires.filter((__, position) => position !== index), { shouldDirty: true, shouldValidate: true })}><X className="h-4 w-4" /></button>
            </div>
          ))}
          {emailsSupplementaires.length < 9 ? <button type="button" className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[var(--color-brand)]" onClick={() => setValue('emails', [...emailsSupplementaires, ''], { shouldDirty: true })}><Plus className="h-3.5 w-3.5" /> Ajouter une adresse e-mail</button> : null}
        </div>
      </div>
      {doublonSupplementaire ? (
        <div className="mb-4 flex items-center gap-2 text-[11.5px] font-medium text-[var(--status-attente-fg)]"><TriangleAlert className="h-3.5 w-3.5 shrink-0" /> Une coordonnée additionnelle appartient déjà à une autre personne ou un autre partenaire.</div>
      ) : null}

      <FloatingLabelInput
        label="Site web"
        placeholder="https://www.exemple.mg"
        erreur={errors.site_web?.message}
        {...register('site_web')}
      />

      <div className="mb-4">
        <label htmlFor="description" className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Décrivez brièvement l'activité du partenaire"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[13.5px] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)]"
          {...register('description')}
        />
      </div>

      {peutGererVisibilite ? (
        <div className="mb-5 flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-3">
          <div>
            <span className="block text-[12.5px] font-semibold">
              Présence sur la vitrine
            </span>
            <span className="block text-xs text-[var(--color-text-secondary)]">
              Un partenaire public et actif apparaît sur la vitrine
            </span>
          </div>
          <select
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[12.5px]"
            {...register('visibilite')}
          >
            <option value="PRIVE">Privée</option>
            <option value="PUBLIC">Visible</option>
          </select>
        </div>
      ) : null}

      <label className="mb-6 flex items-center gap-2.5 text-[12.5px] font-medium">
        <input type="checkbox" className="h-[15px] w-[15px] accent-[var(--color-brand)]" {...register('est_strategique')} />
        Partenaire stratégique
      </label>

      <button
        type="submit"
        disabled={enCours || !isValid || Boolean(doublonIdentite) || Boolean(doublonEmail) || Boolean(doublonTelephone) || Boolean(doublonSupplementaire)}
        className="flex items-center justify-center gap-2 self-start rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </button>
    </form>
  );
}