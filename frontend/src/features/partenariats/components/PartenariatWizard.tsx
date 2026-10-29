// src/features/partenariats/components/PartenariatWizard.tsx

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { WizardProgressBar } from '@/components/forms/wizard/WizardProgressBar';
import { useWizardDraft } from '@/components/forms/wizard/useWizardDraft';
import { GardeNavigation } from '@/components/shared/GardeNavigation';
import { useAuth } from '@/hooks/useAuth';
import { formaterDate } from '@/lib/format';
import { jourCourant } from '@/lib/validators/regles-dates';
import { LIBELLES_DOMAINE_PARTENARIAT } from '@/lib/status-mappings';
import { creerSchemaPartenariat, type PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import { useCreatePartenariat } from '../api/useCreatePartenariat';
import { PartenariatChampsGeneraux } from './PartenariatChampsGeneraux';
import { SelectionPartenaires } from './SelectionPartenaires';
import {
  CLE_BROUILLON_PARTENARIAT_SESSION,
  lireBrouillonPartenariatSession,
  type BrouillonPartenariatSession,
} from '../session-draft';

type CleEtape = 'partenaires' | 'informations' | 'recapitulatif';

interface Etape {
  cle: CleEtape;
  libelle: string;
  champs: FieldPath<PartenariatFormValues>[];
}

function construireEtapes(): Etape[] {
  return [
    { cle: 'partenaires', libelle: 'Partenaires', champs: ['partenaires_ids'] },
    { cle: 'informations', libelle: 'Informations', champs: ['intitule', 'domaine', 'date_debut', 'date_fin', 'objet'] },
    { cle: 'recapitulatif', libelle: 'Récapitulatif', champs: [] },
  ];
}

function LigneRecapitulatif({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{libelle}</dt>
      <dd className="mt-1 whitespace-pre-line text-[13.5px]">{children}</dd>
    </div>
  );
}

function Recapitulatif({
  valeurs,
  libelles,
}: {
  valeurs: PartenariatFormValues;
  libelles: Record<string, string>;
}) {
  const noms = (ids: string[]) => ids.map((id) => libelles[id] ?? id).join(', ');

  return (
    <dl className="flex flex-col gap-4">
      <LigneRecapitulatif libelle="Intitulé">{valeurs.intitule}</LigneRecapitulatif>
      <LigneRecapitulatif libelle="Domaine">
        {valeurs.domaine ? LIBELLES_DOMAINE_PARTENARIAT[valeurs.domaine] : 'Non renseigné'}
      </LigneRecapitulatif>
      <LigneRecapitulatif libelle="Période">
        {valeurs.date_debut ? formaterDate(valeurs.date_debut) : 'Non renseignée'}
        {valeurs.date_fin ? ` au ${formaterDate(valeurs.date_fin)}` : ''}
      </LigneRecapitulatif>
      <LigneRecapitulatif libelle="Objet">{valeurs.objet || 'Non renseigné'}</LigneRecapitulatif>
      <LigneRecapitulatif libelle="Partenaires">{noms(valeurs.partenaires_ids)}</LigneRecapitulatif>
    </dl>
  );
}

export function PartenariatWizard() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const estPresidence = utilisateur?.role === 'PRESIDENCE';
  const cheminBase = estPresidence ? '/presidence' : '/etablissement';

  const etapes = construireEtapes();
  const [index, setIndex] = useState(0);
  const [libelles, setLibelles] = useState<Record<string, string>>({});
  const termineRef = useRef(false);
  const etape = etapes[index] ?? etapes[0]!;
  const estDerniereEtape = index === etapes.length - 1;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<PartenariatFormValues>({
    resolver: zodResolver(creerSchemaPartenariat(false, { exigerDateDebutFuture: true })),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      intitule: '',
      objet: '',
      domaine: undefined,
      date_debut: '',
      date_fin: '',
      partenaires_ids: [],
      etablissements_ids: [],
    },
  });

  const valeurs = watch();
  useEffect(() => {
    if (valeurs.date_debut && valeurs.date_fin) {
      void trigger(['date_debut', 'date_fin']);
    }
  }, [valeurs.date_debut, valeurs.date_fin, trigger]);
  const etapeValide =
    etape.cle === 'partenaires'
      ? valeurs.partenaires_ids.length > 0
      : etape.cle === 'informations'
        ? Boolean(
            valeurs.intitule.trim() &&
            valeurs.domaine &&
            valeurs.date_debut &&
            valeurs.date_debut >= jourCourant() &&
            (!valeurs.date_fin || valeurs.date_fin > valeurs.date_debut),
          )
        : isValid;
  const { mutate: creer, isPending } = useCreatePartenariat();

  const { effacerBrouillon } = useWizardDraft<BrouillonPartenariatSession>({
    cle: `uf_brouillon_partenariat_${utilisateur?.id ?? 'anonyme'}`,
    valeurs: { formulaire: valeurs, libelles, etape: index, version: 2 },
    actif: true,
    onRestaurer: (brouillon) => {
      const contientDesDonnees = brouillon.formulaire.intitule || brouillon.formulaire.partenaires_ids.length > 0;
      if (!contientDesDonnees) {
        return;
      }
      reset({ ...brouillon.formulaire, etablissements_ids: [] });
      setLibelles(brouillon.libelles);
      const ancienneEtape = brouillon.etape;
      const etapeRestauree = brouillon.version === 2
        ? ancienneEtape
        : ancienneEtape <= 1
          ? 0
          : ancienneEtape - 1;
      setIndex(Math.min(etapeRestauree, etapes.length - 1));
      toast.info('Brouillon restauré');
    },
  });

  useEffect(() => {
    const brouillon = lireBrouillonPartenariatSession();
    if (!brouillon) return;

    reset({ ...brouillon.formulaire, etablissements_ids: [] });
    setLibelles(brouillon.libelles ?? {});
    setIndex(0);
    window.sessionStorage.removeItem(CLE_BROUILLON_PARTENARIAT_SESSION);
    toast.info('Brouillon restauré avec le nouveau partenaire');
  }, [reset]);

  function mettreAJourSelection(ids: string[], libellesAjoutes: Record<string, string>) {
    setValue('partenaires_ids', ids, { shouldDirty: true, shouldValidate: true });
    setLibelles((precedents) => ({ ...precedents, ...libellesAjoutes }));
  }

  function continuerVersCreationPartenaire(nomPartenaire: string) {
    const brouillon: BrouillonPartenariatSession = {
      formulaire: { ...valeurs, etablissements_ids: [] },
      libelles,
      etape: 0,
      version: 2,
      nomPartenaire,
    };
    window.sessionStorage.setItem(CLE_BROUILLON_PARTENARIAT_SESSION, JSON.stringify(brouillon));
    navigate(`${cheminBase}/partenaires-partenariats/partenaires/nouveau?retour=wizard-partenariat`);
  }

  async function allerEtapeSuivante() {
    const valide = await trigger(etape.champs);
    if (valide) {
      setIndex((courant) => courant + 1);
    }
  }

  function creerPartenariat(valeursFormulaire: PartenariatFormValues) {
    creer(valeursFormulaire, {
      onSuccess: () => {
        effacerBrouillon();
        termineRef.current = true;
        toast.success('Partenariat créé en brouillon');
        navigate(`${cheminBase}/partenaires-partenariats/partenariats`);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  function signalerFormulaireIncomplet() {
    toast.error('Certaines informations sont incomplètes', {
      description: 'Revenez aux étapes précédentes pour les compléter.',
    });
  }

  function annulerCreation() {
    termineRef.current = true;
    effacerBrouillon();
    navigate(`${cheminBase}/partenaires-partenariats/partenariats`);
  }

  return (
    <section className="max-w-[720px] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <GardeNavigation doitBloquer={() => isDirty && !termineRef.current} />

      <div className="p-5 sm:p-6">
        <WizardProgressBar etapes={etapes.map((valeur) => valeur.libelle)} etapeActive={index} />

        <form onSubmit={(evenement) => evenement.preventDefault()} noValidate>
          {etape.cle === 'partenaires' ? (
            <SelectionPartenaires
              selection={valeurs.partenaires_ids}
              libelles={libelles}
              onChange={mettreAJourSelection}
              erreur={errors.partenaires_ids?.message}
              onCreerPartenaire={continuerVersCreationPartenaire}
            />
          ) : null}

          {etape.cle === 'informations' ? (
            <PartenariatChampsGeneraux register={register} errors={errors} autoFocus />
          ) : null}

          {etape.cle === 'recapitulatif' ? <Recapitulatif valeurs={valeurs} libelles={libelles} /> : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIndex((courant) => Math.max(courant - 1, 0))}
              disabled={index === 0 || isPending}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Précédent
            </button>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {estDerniereEtape ? (
                <button
                  type="button"
                  onClick={handleSubmit(creerPartenariat, signalerFormulaireIncomplet)}
                  disabled={isPending || !isValid}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-70"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Créer le partenariat
                </button>
              ) : (
                <button
                  type="button"
                  onClick={allerEtapeSuivante}
                  disabled={isPending || !etapeValide}
                  className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={annulerCreation}
                disabled={isPending}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}