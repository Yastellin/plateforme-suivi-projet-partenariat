// src/features/partenaires/pages/PartenaireCreatePage.tsx

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { TriangleAlert } from 'lucide-react';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PartenaireForm } from '../components/PartenaireForm';
import { useCreatePartenaire } from '../api/useCreatePartenaire';
import { useRechercheDoublon, type PartenaireAvecRaisons } from '../api/useRechercheDoublon';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';
import {
  CLE_BROUILLON_PARTENARIAT_SESSION,
  lireBrouillonPartenariatSession,
  type BrouillonPartenariatSession,
} from '@/features/partenariats/session-draft';
import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';

export function PartenaireCreatePage() {
  const navigate = useNavigate();
  const [parametresRecherche] = useSearchParams();
  const retourWizard = parametresRecherche.get('retour') === 'wizard-partenariat';
  const nomDepuisUrl = parametresRecherche.get('nom')?.trim() ?? '';
  const { utilisateur } = useAuth();
  const [nomRecherche, setNomRecherche] = useState(() => {
    if (nomDepuisUrl) return nomDepuisUrl;
    return retourWizard ? lireBrouillonPartenariatSession()?.nomPartenaire ?? '' : '';
  });
  const [etapeFormulaire, setEtapeFormulaire] = useState(retourWizard);

  const estPresidence = utilisateur?.role === 'PRESIDENCE';
  const nomDifferee = useDebounce(nomRecherche, 400);
  const { data: doublons, isFetching: rechercheEnCours } = useRechercheDoublon('nom', nomDifferee);
  const { mutate: creer, isPending } = useCreatePartenaire();
  const doublonsPartenaires = doublons?.filter(
    (doublon): doublon is PartenaireAvecRaisons => 'nom' in doublon,
  );

  const cheminBase = estPresidence ? '/presidence' : '/etablissement';

  function annulerCreation() {
    navigate(
      retourWizard
        ? `${cheminBase}/partenaires-partenariats/partenariats/nouveau`
        : `${cheminBase}/partenaires-partenariats/partenaires`,
    );
  }

  function onSoumettre(valeurs: PartenaireFormValues, logo?: File) {
    creer({ valeurs, logo }, {
      onSuccess: ({ partenaire, logoTeleverse }) => {
        if (logo && !logoTeleverse) {
          toast.error('Partenaire créé, mais le logo n’a pas pu être envoyé. Vous pourrez le réessayer depuis sa fiche.');
        } else {
          toast.success(logo ? 'Partenaire créé avec son logo' : 'Partenaire créé');
        }
        if (retourWizard) {
          const brouillonActuel = lireBrouillonPartenariatSession();
          const formulaireParDefaut: PartenariatFormValues = {
            intitule: '',
            objet: '',
            domaine: 'AUTRE',
            date_debut: '',
            date_fin: '',
            partenaires_ids: [],
            etablissements_ids: [],
          };
          const formulaire = brouillonActuel?.formulaire ?? formulaireParDefaut;
          const brouillonActualise: BrouillonPartenariatSession = {
            formulaire: {
              ...formulaire,
              partenaires_ids: Array.from(new Set([...formulaire.partenaires_ids, partenaire.id])),
              etablissements_ids: [],
            },
            libelles: { ...brouillonActuel?.libelles, [partenaire.id]: partenaire.nom },
            etape: 0,
            version: 2,
            nomPartenaire: partenaire.nom,
          };
          window.sessionStorage.setItem(
            CLE_BROUILLON_PARTENARIAT_SESSION,
            JSON.stringify(brouillonActualise),
          );
          navigate(`${cheminBase}/partenaires-partenariats/partenariats/nouveau`);
          return;
        }
        navigate(`${cheminBase}/partenaires-partenariats/partenaires`);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <PageHeader
        titre="Nouveau partenaire"
        description="Enregistrez un nouveau partenaire dans la plateforme."
      />

      <Panel>
        <PanelBody>
          {!etapeFormulaire ? (
            <div className="mx-auto w-full max-w-[560px]">
              <FloatingLabelInput
                label="Nom du partenaire"
                autoFocus
                placeholder="Ex : Airtel Madagascar"
                value={nomRecherche}
                onChange={(e) => setNomRecherche(e.target.value)}
                aide="Vérifiez d'abord qu'il n'existe pas déjà"
              />

              {rechercheEnCours && nomDifferee.trim().length >= 3 ? (
                <p className="mb-4 text-[12.5px] text-[var(--color-text-secondary)]">Recherche en cours…</p>
              ) : null}

              {doublonsPartenaires && doublonsPartenaires.length > 0 ? (
                <div className="mb-4 flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--status-attente-fg)] bg-[var(--status-attente-bg)] p-3.5">
                  <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--status-attente-fg)]">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    Partenaire(s) similaire(s) déjà enregistré(s)
                  </div>
                  <ul className="flex flex-col gap-1">
                    {doublonsPartenaires.map((doublon) => (
                      <li key={doublon.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`${cheminBase}/partenaires-partenariats/partenaires/${doublon.id}`)}
                          className="text-[13px] font-semibold text-[var(--color-brand)] hover:underline"
                        >
                          {doublon.nom}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={nomRecherche.trim().length === 0}
                  onClick={() => setEtapeFormulaire(true)}
                  className="rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuer
                </button>
                <button
                  type="button"
                  onClick={annulerCreation}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)]"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <PartenaireForm
              nomInitial={nomRecherche}
              peutGererVisibilite={estPresidence}
              onAnnuler={annulerCreation}
              onSoumettre={onSoumettre}
              enCours={isPending}
            />
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
