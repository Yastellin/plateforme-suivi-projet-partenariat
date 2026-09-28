// src/features/partenaires/pages/PartenaireCreatePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TriangleAlert } from 'lucide-react';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PartenaireForm } from '../components/PartenaireForm';
import { useCreatePartenaire } from '../api/useCreatePartenaire';
import { useRechercheDoublon } from '../api/useRechercheDoublon';
import { useEtablissements } from '@/features/etablissements/api/useEtablissements';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

export function PartenaireCreatePage() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [nomRecherche, setNomRecherche] = useState('');
  const [etapeFormulaire, setEtapeFormulaire] = useState(false);

  const estPresidence = utilisateur?.role === 'PRESIDENCE';
  const nomDifferee = useDebounce(nomRecherche, 400);
  const { data: doublons, isFetching: rechercheEnCours } = useRechercheDoublon(nomDifferee);
  const { data: etablissements } = useEtablissements(estPresidence);
  const { mutate: creer, isPending } = useCreatePartenaire();

  const cheminBase = estPresidence ? '/presidence' : '/etablissement';

  function onSoumettre(valeurs: PartenaireFormValues) {
    creer(valeurs, {
      onSuccess: (partenaire) => {
        toast.success('Partenaire créé');
        navigate(`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  return (
    <div>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-bold">Nouveau partenaire</h1>
      </div>

      <section className="max-w-[640px] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        {!etapeFormulaire ? (
          <div className="p-5">
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

            {doublons && doublons.length > 0 ? (
              <div className="mb-4 flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--status-attente-fg)] bg-[var(--status-attente-bg)] p-3.5">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--status-attente-fg)]">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Partenaire(s) similaire(s) déjà enregistré(s)
                </div>
                <ul className="flex flex-col gap-1">
                  {doublons.map((doublon) => (
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

            <button
              type="button"
              disabled={nomRecherche.trim().length === 0}
              onClick={() => setEtapeFormulaire(true)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuer
            </button>
          </div>
        ) : (
          <div className="p-5">
            <PartenaireForm
              nomInitial={nomRecherche}
              etablissements={estPresidence ? etablissements : undefined}
              onSoumettre={onSoumettre}
              enCours={isPending}
            />
          </div>
        )}
      </section>
    </div>
  );
}