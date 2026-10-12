// src/features/partenariats/components/PartenariatChampsGeneraux.tsx

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { DateInput } from '@/components/forms/inputs/DateInput';
import { DOMAINES_PARTENARIAT, type PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import { LIBELLES_DOMAINE_PARTENARIAT } from '@/lib/status-mappings';

interface PartenariatChampsGenerauxProps {
  register: UseFormRegister<PartenariatFormValues>;
  errors: FieldErrors<PartenariatFormValues>;
  autoFocus?: boolean;
}

const CLASSE_LIBELLE = 'mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]';
const CLASSE_CHAMP =
  'w-full rounded-[var(--radius-sm)] border bg-[var(--color-surface)] px-3 py-2.5 text-[13.5px] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)]';

export function PartenariatChampsGeneraux({ register, errors, autoFocus = false }: PartenariatChampsGenerauxProps) {
  return (
    <div>
      <FloatingLabelInput
        label="Intitulé"
        requis
        autoFocus={autoFocus}
        placeholder="Ex : Convention-cadre de coopération en formation"
        erreur={errors.intitule?.message}
        {...register('intitule')}
      />

      <div className="mb-4">
        <label htmlFor="domaine" className={CLASSE_LIBELLE}>
          Domaine <span className="text-[var(--status-expire-fg)]">*</span>
        </label>
        <select
          id="domaine"
          className={`${CLASSE_CHAMP} ${errors.domaine ? 'border-[var(--status-expire-fg)]' : 'border-[var(--color-border)]'}`}
          {...register('domaine')}
        >
          <option value="">Sélectionnez un domaine</option>
          {DOMAINES_PARTENARIAT.map((domaine) => (
            <option key={domaine} value={domaine}>
              {LIBELLES_DOMAINE_PARTENARIAT[domaine]}
            </option>
          ))}
        </select>
        {errors.domaine ? (
          <p role="alert" className="mt-1 px-0.5 text-[11.5px] font-medium text-[var(--status-expire-fg)]">
            {errors.domaine.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <DateInput label="Date de début" requis erreur={errors.date_debut?.message} {...register('date_debut')} />
        <DateInput
          label="Date de fin"
          aide="Facultative. Doit être postérieure à la date de début."
          erreur={errors.date_fin?.message}
          {...register('date_fin')}
        />
      </div>

      <div className="mb-2">
        <label htmlFor="objet" className={CLASSE_LIBELLE}>
          Objet
        </label>
        <textarea
          id="objet"
          rows={3}
          placeholder="Décrivez l'objet de la collaboration"
          className={`${CLASSE_CHAMP} border-[var(--color-border)]`}
          {...register('objet')}
        />
      </div>
    </div>
  );
}