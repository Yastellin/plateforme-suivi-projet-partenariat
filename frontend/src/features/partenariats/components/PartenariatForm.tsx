// src/features/partenariats/components/PartenariatForm.tsx

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { GardeNavigation } from '@/components/shared/GardeNavigation';
import { versChampDate } from '@/lib/format';
import { creerSchemaPartenariat, type PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import type { Partenariat } from '@/types/api';
import { CHAMPS_SUIVI } from '../lib/champs-suivi';
import { PartenariatChampsGeneraux } from './PartenariatChampsGeneraux';
import { SelectionEtablissements } from './SelectionEtablissements';
import { SelectionPartenaires } from './SelectionPartenaires';

interface PartenariatFormProps {
  partenariat: Partenariat;
  estPresidence: boolean;
  onSoumettre: (valeurs: PartenariatFormValues, apresSucces: () => void) => void;
  onAnnuler: () => void;
  enCours: boolean;
}

function valeursInitiales(partenariat: Partenariat, estPresidence: boolean): PartenariatFormValues {
  return {
    intitule: partenariat.intitule,
    objet: partenariat.objet ?? '',
    domaine: partenariat.domaine,
    date_debut: versChampDate(partenariat.date_debut),
    date_fin: partenariat.date_fin ? versChampDate(partenariat.date_fin) : '',
    partenaires_ids: partenariat.partenaires.map((partenaire) => partenaire.id),
    etablissements_ids: estPresidence ? partenariat.etablissements.map((etablissement) => etablissement.id) : [],
    actions_realisees: estPresidence ? (partenariat.actions_realisees ?? '') : undefined,
    actions_en_cours: estPresidence ? (partenariat.actions_en_cours ?? '') : undefined,
    actions_prevues: estPresidence ? (partenariat.actions_prevues ?? '') : undefined,
    resultats_obtenus: estPresidence ? (partenariat.resultats_obtenus ?? '') : undefined,
    difficultes_contraintes: estPresidence ? (partenariat.difficultes_contraintes ?? '') : undefined,
    perspectives_recommandations: estPresidence ? (partenariat.perspectives_recommandations ?? '') : undefined,
  };
}

function libellesInitiaux(partenariat: Partenariat): Record<string, string> {
  const libelles: Record<string, string> = {};
  partenariat.partenaires.forEach((partenaire) => {
    libelles[partenaire.id] = partenaire.nom;
  });
  partenariat.etablissements.forEach((etablissement) => {
    libelles[etablissement.id] = etablissement.sigle ?? etablissement.nom;
  });
  return libelles;
}

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-[15px] font-bold">{titre}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PartenariatForm({ partenariat, estPresidence, onSoumettre, onAnnuler, enCours }: PartenariatFormProps) {
  const [libelles, setLibelles] = useState<Record<string, string>>(() => libellesInitiaux(partenariat));
  const premierRendu = useRef(true);
  const navigationAutorisee = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<PartenariatFormValues>({
    resolver: zodResolver(
      creerSchemaPartenariat(
        estPresidence && (partenariat?.etablissements.length ?? 0) > 0,
        { exigerDateDebutFuture: !partenariat },
      ),
    ),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: valeursInitiales(partenariat, estPresidence),
  });

  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    reset(valeursInitiales(partenariat, estPresidence));
    setLibelles(libellesInitiaux(partenariat));
  }, [partenariat, estPresidence, reset]);

  const valeurs = watch();
  useEffect(() => {
    if (valeurs.date_debut && valeurs.date_fin) {
      void trigger(['date_debut', 'date_fin']);
    }
  }, [valeurs.date_debut, valeurs.date_fin, trigger]);

  function mettreAJourSelection(
    champ: 'partenaires_ids' | 'etablissements_ids',
    ids: string[],
    libellesAjoutes: Record<string, string>,
  ) {
    setValue(champ, ids, { shouldDirty: true, shouldValidate: true });
    setLibelles((precedents) => ({ ...precedents, ...libellesAjoutes }));
  }

  return (
    <form
      onSubmit={handleSubmit((valeursSoumises) =>
        onSoumettre(valeursSoumises, () => {
          navigationAutorisee.current = true;
        }),
      )}
      noValidate
      className="flex flex-col gap-5"
    >
      <GardeNavigation doitBloquer={() => isDirty && !navigationAutorisee.current} />

      <Bloc titre="Informations générales">
        <PartenariatChampsGeneraux register={register} errors={errors} />
      </Bloc>

      <div className={estPresidence ? 'grid grid-cols-1 gap-5 md:grid-cols-2' : ''}>
        <Bloc titre="Partenaires concernés">
          <SelectionPartenaires
            selection={valeurs.partenaires_ids}
            libelles={libelles}
            onChange={(ids, ajoutes) => mettreAJourSelection('partenaires_ids', ids, ajoutes)}
            erreur={errors.partenaires_ids?.message}
          />
        </Bloc>

        {estPresidence ? (
          <Bloc titre="Établissements concernés">
            <SelectionEtablissements
              selection={valeurs.etablissements_ids}
              libelles={libelles}
              onChange={(ids, ajoutes) => mettreAJourSelection('etablissements_ids', ids, ajoutes)}
              erreur={errors.etablissements_ids?.message}
            />
          </Bloc>
        ) : null}
      </div>

      {estPresidence ? (
        <Bloc titre="Suivi">
          <div className="flex flex-col gap-4">
            {CHAMPS_SUIVI.map((champ) => (
              <div key={champ.cle}>
                <label
                  htmlFor={champ.cle}
                  className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
                >
                  {champ.libelle}
                </label>
                <textarea
                  id={champ.cle}
                  rows={3}
                  placeholder={champ.placeholder}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[13.5px] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)]"
                  {...register(champ.cle)}
                />
              </div>
            ))}
          </div>
        </Bloc>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={enCours || !isValid}
          className="flex items-center justify-center gap-2 self-start rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-70"
        >
          {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={() => {
            navigationAutorisee.current = true;
            reset(valeursInitiales(partenariat, estPresidence));
            onAnnuler();
          }}
          disabled={enCours}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}