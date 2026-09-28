// src/features/partenariats/components/PartenariatWizard.tsx

<<<<<<< Updated upstream
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WizardProgressBar } from "@/components/forms/wizard/WizardProgressBar"
import { SelectionEtablissements } from "@/features/partenariats/components/SelectionEtablissements"
import { SelectionPartenaires } from "@/features/partenariats/components/SelectionPartenaires"
import { useCreatePartenariat } from "@/features/partenariats/api/useCreatePartenariat"
import {
  schemaPartenariat,
  type PartenariatFormValues,
} from "@/lib/validators/partenariat.schema"
import type { Partenariat } from "@/types/api"
=======
import { useRef, useState, type ReactNode } from 'react';
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
import { LIBELLES_DOMAINE_PARTENARIAT } from '@/lib/status-mappings';
import { creerSchemaPartenariat, type PartenariatFormValues } from '@/lib/validators/partenariat.schema';
import { useCreatePartenariat } from '../api/useCreatePartenariat';
import { PartenariatChampsGeneraux } from './PartenariatChampsGeneraux';
import { SelectionEtablissements } from './SelectionEtablissements';
import { SelectionPartenaires } from './SelectionPartenaires';
>>>>>>> Stashed changes

type CleEtape = 'partenaires' | 'etablissements' | 'informations' | 'recapitulatif';

interface Etape {
  cle: CleEtape;
  libelle: string;
  champs: FieldPath<PartenariatFormValues>[];
}

interface BrouillonWizard {
  formulaire: PartenariatFormValues;
  libelles: Record<string, string>;
  etape: number;
}

function construireEtapes(estPresidence: boolean): Etape[] {
  const etapes: Etape[] = [{ cle: 'partenaires', libelle: 'Partenaires', champs: ['partenaires_ids'] }];

  if (estPresidence) {
    etapes.push({ cle: 'etablissements', libelle: 'Établissements', champs: ['etablissements_ids'] });
  }

  etapes.push(
    { cle: 'informations', libelle: 'Informations', champs: ['intitule', 'domaine', 'date_debut', 'date_fin', 'objet'] },
    { cle: 'recapitulatif', libelle: 'Récapitulatif', champs: [] },
  );

  return etapes;
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
      {valeurs.etablissements_ids.length > 0 ? (
        <LigneRecapitulatif libelle="Établissements">{noms(valeurs.etablissements_ids)}</LigneRecapitulatif>
      ) : null}
    </dl>
  );
}

export function PartenariatWizard() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const estPresidence = utilisateur?.role === 'PRESIDENCE';
  const cheminBase = estPresidence ? '/presidence' : '/etablissement';

  const etapes = construireEtapes(estPresidence);
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
    formState: { errors, isDirty },
  } = useForm<PartenariatFormValues>({
    resolver: zodResolver(creerSchemaPartenariat(estPresidence)),
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
  const { mutate: creer, isPending } = useCreatePartenariat();

<<<<<<< Updated upstream
  const suivant = () => {
    if (derniereEtape) {
      handleSubmit(onSubmit)()
    } else {
      setEtapeActive((e) => e + 1)
=======
  const { effacerBrouillon } = useWizardDraft<BrouillonWizard>({
    cle: `uf_brouillon_partenariat_${utilisateur?.id ?? 'anonyme'}`,
    valeurs: { formulaire: valeurs, libelles, etape: index },
    actif: true,
    onRestaurer: (brouillon) => {
      const contientDesDonnees = brouillon.formulaire.intitule || brouillon.formulaire.partenaires_ids.length > 0;
      if (!contientDesDonnees) {
        return;
      }
      reset(brouillon.formulaire);
      setLibelles(brouillon.libelles);
      setIndex(Math.min(brouillon.etape, etapes.length - 1));
      toast.info('Brouillon restauré');
    },
  });

  function mettreAJourSelection(
    champ: 'partenaires_ids' | 'etablissements_ids',
    ids: string[],
    libellesAjoutes: Record<string, string>,
  ) {
    setValue(champ, ids, { shouldDirty: true, shouldValidate: true });
    setLibelles((precedents) => ({ ...precedents, ...libellesAjoutes }));
  }

  async function allerEtapeSuivante() {
    const valide = await trigger(etape.champs);
    if (valide) {
      setIndex((courant) => courant + 1);
>>>>>>> Stashed changes
    }
  }

  function creerPartenariat(valeursFormulaire: PartenariatFormValues) {
    creer(valeursFormulaire, {
      onSuccess: (partenariat) => {
<<<<<<< Updated upstream
        toast.success("Partenariat cree avec succes !")
        onSucces(partenariat)
=======
        effacerBrouillon();
        termineRef.current = true;
        toast.success('Partenariat créé en brouillon');
        navigate(`${cheminBase}/partenaires-partenariats/partenariats/${partenariat.id}`);
>>>>>>> Stashed changes
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  function signalerFormulaireIncomplet() {
    toast.error('Certaines informations sont incomplètes', {
      description: 'Revenez aux étapes précédentes pour les compléter.',
    });
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
              onChange={(ids, ajoutes) => mettreAJourSelection('partenaires_ids', ids, ajoutes)}
              erreur={errors.partenaires_ids?.message}
            />
          ) : null}

          {etape.cle === 'etablissements' ? (
            <SelectionEtablissements
              selection={valeurs.etablissements_ids}
              libelles={libelles}
              onChange={(ids, ajoutes) => mettreAJourSelection('etablissements_ids', ids, ajoutes)}
              erreur={errors.etablissements_ids?.message}
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

            {estDerniereEtape ? (
              <button
                type="button"
                onClick={handleSubmit(creerPartenariat, signalerFormulaireIncomplet)}
                disabled={isPending}
                className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-70"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Créer le partenariat
              </button>
            ) : (
              <button
                type="button"
                onClick={allerEtapeSuivante}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
              >
                Suivant
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}