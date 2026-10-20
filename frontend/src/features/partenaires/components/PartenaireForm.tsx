// src/features/partenaires/components/PartenaireForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, TriangleAlert } from 'lucide-react';
import { creerSchemaPartenaire, type PartenaireFormValues } from '@/lib/validators/partenaire.schema';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PhoneInputSanitized } from '@/components/forms/inputs/PhoneInputSanitized';
import { useRechercheDoublon } from '../api/useRechercheDoublon';
import { useDebounce } from '@/hooks/useDebounce';
import type { Etablissement, Partenaire } from '@/types/api';

interface PartenaireFormProps {
  partenaire?: Partenaire;
  nomInitial?: string;
  etablissements?: Etablissement[];
  onSoumettre: (valeurs: PartenaireFormValues) => void;
  enCours: boolean;
}

export function PartenaireForm({ partenaire, nomInitial, etablissements, onSoumettre, enCours }: PartenaireFormProps) {
  const afficherSelectionEtablissement = etablissements !== undefined;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartenaireFormValues>({
    resolver: zodResolver(creerSchemaPartenaire(afficherSelectionEtablissement)),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nom: partenaire?.nom ?? nomInitial ?? '',
      type: partenaire?.type ?? '',
      pays: partenaire?.pays ?? '',
      adresse: partenaire?.adresse ?? '',
      telephone: partenaire?.telephone ?? '',
      email: partenaire?.email ?? '',
      site_web: partenaire?.site_web ?? '',
      description: partenaire?.description ?? '',
      visibilite: partenaire?.visibilite ?? 'PRIVE',
      est_strategique: partenaire?.est_strategique ?? false,
      etablissement_id: partenaire?.etablissement_id ?? '',
    },
  });

  const email = watch('email') ?? '';
  const emailDifferee = useDebounce(email, 400);
  const { data: doublonsEmail } = useRechercheDoublon('email', emailDifferee);
  const doublonEmail = doublonsEmail?.find((d) => d.id !== partenaire?.id);

  return (
    <form onSubmit={handleSubmit(onSoumettre)} noValidate className="flex flex-col gap-1">
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
          erreur={errors.nom?.message}
          caracteresInterdits={/[^a-zA-ZÀ-ÿ\s]/g}
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
        <PhoneInputSanitized erreur={errors.telephone?.message} {...register('telephone')} />
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
              Un partenaire avec cet e-mail existe déjà dans cet établissement.
            </div>
          ) : null}
        </div>
      </div>

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

      <div className="mb-5 flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-3">
        <div>
          <span className="block text-[12.5px] font-semibold">Visibilité publique</span>
          <span className="block text-xs text-[var(--color-text-secondary)]">Le partenaire apparaît sur l'espace public</span>
        </div>
        <select
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[12.5px]"
          {...register('visibilite')}
        >
          <option value="PRIVE">Privée</option>
          <option value="PUBLIC">Publique</option>
        </select>
      </div>

      <label className="mb-6 flex items-center gap-2.5 text-[12.5px] font-medium">
        <input type="checkbox" className="h-[15px] w-[15px] accent-[var(--color-brand)]" {...register('est_strategique')} />
        Partenaire stratégique
      </label>

      <button
        type="submit"
        disabled={enCours || Boolean(doublonEmail)}
        className="flex items-center justify-center gap-2 self-start rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </button>
    </form>
  );
}