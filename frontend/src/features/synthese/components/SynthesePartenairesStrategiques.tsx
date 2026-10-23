// src/features/synthese/components/SynthesePartenairesStrategiques.tsx
import { useEffect, useMemo, useState } from 'react';
import { Handshake, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { DestructiveConfirmDialog } from '@/components/shared/DestructiveConfirmDialog';
import { LogoMedia } from '@/components/shared/ImageMedia';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreatePartenaireStrategique } from '../api/useCreatePartenaireStrategique';
import { useDeletePartenaireStrategique } from '../api/useDeletePartenaireStrategique';
import { usePartenairesEtablissement } from '../api/usePartenairesEtablissement';
import type { SynthesePartenaireStrategique } from '@/types/api';

interface SynthesePartenairesStrategiquesProps {
  etablissementId: string;
  annee: number;
  partenaires: SynthesePartenaireStrategique[];
  /** Seule la Présidence peut désigner ou retirer un partenaire stratégique. */
  peutGerer: boolean;
}

const CLASSE_BOUTON_SECONDAIRE =
  'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-60';

/** Désignation des partenaires stratégiques d'un établissement pour une année. */
export function SynthesePartenairesStrategiques({
  etablissementId,
  annee,
  partenaires,
  peutGerer,
}: SynthesePartenairesStrategiquesProps) {
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState('');
  const [tousEtablissements, setTousEtablissements] = useState(false);
  const [partenaireARetirer, setPartenaireARetirer] = useState<SynthesePartenaireStrategique | null>(null);

  const rechercheDifferee = useDebounce(recherche, 300);
  const { data: pagePartenaires, isLoading: chargementPartenaires } = usePartenairesEtablissement({
    etablissement_id: etablissementId,
    recherche: rechercheDifferee,
  });
  const creation = useCreatePartenaireStrategique();
  const retrait = useDeletePartenaireStrategique();

  useEffect(() => {
    if (dialogueOuvert) {
      setRecherche('');
      setSelection('');
      setTousEtablissements(false);
    }
  }, [dialogueOuvert]);

  const identifiantsDesignes = useMemo(
    () => new Set(partenaires.map((partenaire) => partenaire.partenaire_id)),
    [partenaires],
  );

  const candidats = useMemo(
    () =>
      (pagePartenaires?.data ?? []).filter((partenaire) => {
        if (identifiantsDesignes.has(partenaire.id)) return false;
        return tousEtablissements || !etablissementId || partenaire.etablissement_id === etablissementId;
      }),
    [pagePartenaires, identifiantsDesignes, tousEtablissements, etablissementId],
  );

  const aucunPartenaireCharge = !chargementPartenaires && (pagePartenaires?.data.length ?? 0) === 0;

  function designer() {
    if (!selection) return;

    creation.mutate(
      { etablissement_id: etablissementId, annee, partenaire_id: selection },
      {
        onSuccess: () => {
          toast.success(`Partenaire stratégique désigné pour ${annee}`);
          setDialogueOuvert(false);
        },
        onError: (erreurMutation: Error) => toast.error(erreurMutation.message),
      },
    );
  }

  function confirmerRetrait() {
    if (!partenaireARetirer) return;
    const partenaire = partenaireARetirer;

    retrait.mutate(partenaire.id, {
      onSuccess: () => {
        toast.success('Partenaire stratégique retiré');
        setPartenaireARetirer(null);
      },
      onError: (erreurMutation: Error) => {
        toast.error(erreurMutation.message);
        setPartenaireARetirer(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {partenaires.length === 0 ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] bg-[var(--color-page-bg)] p-4">
          <Handshake className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-text-secondary)]" />
          <p className="text-[12.5px] text-[var(--color-text-secondary)]">
            Aucun partenaire stratégique désigné pour {annee}.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {partenaires.map((partenaire) => (
            <li
              key={partenaire.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <LogoMedia
                  src={partenaire.partenaire_logo_url}
                  nom={partenaire.partenaire_nom ?? 'Partenaire'}
                  className="h-8 w-8 shrink-0 rounded-md border border-[var(--color-border)] bg-white object-contain p-0.5 text-[10px]"
                  loading="lazy"
                />
                <span className="truncate text-[13px] font-semibold">
                  {partenaire.partenaire_nom ?? 'Partenaire'}
                </span>
              </span>

              {peutGerer ? (
                <button
                  type="button"
                  aria-label={`Retirer ${partenaire.partenaire_nom ?? 'ce partenaire'}`}
                  onClick={() => setPartenaireARetirer(partenaire)}
                  className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--status-expire-bg)] hover:text-[var(--status-expire-fg)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {peutGerer ? (
        <button
          type="button"
          onClick={() => setDialogueOuvert(true)}
          className="inline-flex items-center gap-1.5 self-start rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-[var(--color-brand-hover)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Désigner un partenaire
        </button>
      ) : null}

      <Dialog open={dialogueOuvert} onOpenChange={(ouvert) => setDialogueOuvert(ouvert)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Désigner un partenaire stratégique</DialogTitle>
            <DialogDescription>
              Le partenaire sera rattaché à la synthèse {annee} de cet établissement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="synthese-recherche-partenaire"
                className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
              >
                Rechercher
              </label>
              <input
                id="synthese-recherche-partenaire"
                type="search"
                value={recherche}
                onChange={(evenement) => setRecherche(evenement.target.value)}
                placeholder="Nom du partenaire…"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13.5px] outline-none focus:border-[var(--color-brand)]"
              />
            </div>

            <label className="flex items-center gap-2.5 text-[12.5px] font-medium">
              <input
                type="checkbox"
                checked={tousEtablissements}
                onChange={(evenement) => setTousEtablissements(evenement.target.checked)}
                className="h-[15px] w-[15px] accent-[var(--color-brand)]"
              />
              Afficher aussi les partenaires des autres établissements
            </label>

            <div>
              <label
                htmlFor="synthese-partenaire-select"
                className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
              >
                Partenaire <span className="text-[var(--status-expire-fg)]">*</span>
              </label>
              <select
                id="synthese-partenaire-select"
                value={selection}
                onChange={(evenement) => setSelection(evenement.target.value)}
                disabled={chargementPartenaires}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[13.5px] outline-none focus:border-[var(--color-brand)] disabled:opacity-60"
              >
                <option value="">Sélectionnez un partenaire</option>
                {candidats.map((partenaire) => (
                  <option key={partenaire.id} value={partenaire.id}>
                    {partenaire.nom}
                    {partenaire.pays ? ` — ${partenaire.pays}` : ''}
                    {partenaire.statut === 'SUSPENDU' ? ' (suspendu)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {chargementPartenaires ? (
              <p className="text-[12px] text-[var(--color-text-secondary)]">Chargement des partenaires…</p>
            ) : null}

            {aucunPartenaireCharge ? (
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Aucun partenaire ne correspond à cette recherche
                {tousEtablissements ? '' : ' pour cet établissement'}.
              </p>
            ) : null}

            {!aucunPartenaireCharge && candidats.length === 0 ? (
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Tous les partenaires correspondants sont déjà désignés comme stratégiques.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDialogueOuvert(false)}
              disabled={creation.isPending}
              className={CLASSE_BOUTON_SECONDAIRE}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={designer}
              disabled={!selection || creation.isPending}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
            >
              {creation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Désigner
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DestructiveConfirmDialog
        ouvert={partenaireARetirer !== null}
        onFermer={() => setPartenaireARetirer(null)}
        onConfirmer={confirmerRetrait}
        titre="Retirer ce partenaire stratégique"
        description={`Le partenaire ne sera plus associé à la synthèse ${annee} de cet établissement.`}
        nomCible={partenaireARetirer?.partenaire_nom ?? ''}
        libelleAction="Retirer"
        enCours={retrait.isPending}
      />
    </div>
  );
}
