// src/features/synthese/components/SyntheseNarratif.tsx
import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog";
import { useCreateSyntheseItem } from "../api/useCreateSyntheseItem";
import { useDeleteSyntheseItem } from "../api/useDeleteSyntheseItem";
import { useRemplacerSyntheseItem } from "../api/useRemplacerSyntheseItem";
import {
  grouperItemsParType,
  libelleTypeItem,
  validerValeurItem,
} from "../lib/synthese";
import type { SyntheseItem } from "@/types/api";

interface SyntheseNarratifProps {
  etablissementId: string;
  annee: number;
  items: SyntheseItem[];
  /** Seule la Présidence peut créer, modifier ou supprimer un élément narratif. */
  peutGerer: boolean;
}

interface EditionEnCours {
  type: string;
  valeur: string;
  itemId?: string;
}

const CLASSE_BOUTON_SECONDAIRE =
  "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-60";

/**
 * Éléments narratifs de la synthèse (domaine principal, défi majeur,
 * priorité future). Le backend n'accepte qu'un seul item par type et par
 * année : « Modifier » remplace donc l'item existant (DELETE puis POST).
 */
export function SyntheseNarratif({
  etablissementId,
  annee,
  items,
  peutGerer,
}: SyntheseNarratifProps) {
  const creation = useCreateSyntheseItem();
  const remplacement = useRemplacerSyntheseItem();
  const suppression = useDeleteSyntheseItem();

  const [edition, setEdition] = useState<EditionEnCours | null>(null);
  const [erreurSaisie, setErreurSaisie] = useState<string | null>(null);
  const [itemASupprimer, setItemASupprimer] = useState<SyntheseItem | null>(
    null,
  );

  const groupes = useMemo(() => grouperItemsParType(items), [items]);
  const enregistrementEnCours = creation.isPending || remplacement.isPending;
  const erreurValidationCourante = edition
    ? validerValeurItem(edition.valeur)
    : null;

  function ouvrirEdition(type: string, item?: SyntheseItem) {
    setEdition({ type, valeur: item?.valeur ?? "", itemId: item?.id });
    setErreurSaisie(null);
  }

  function fermerEdition() {
    setEdition(null);
    setErreurSaisie(null);
  }

  function enregistrer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (!edition) return;

    const erreur = validerValeurItem(edition.valeur);
    if (erreur) {
      setErreurSaisie(erreur);
      return;
    }

    const valeur = edition.valeur.trim();
    const type = edition.type;
    const libelle = libelleTypeItem(type);

    const options = {
      onSuccess: () => {
        toast.success(`${libelle} enregistré pour ${annee}`);
        fermerEdition();
      },
      onError: (erreurMutation: Error) => {
        toast.error(erreurMutation.message);
        // Un 409 signale un item déjà présent : la saisie reste ouverte pour
        // que la Présidence puisse la reprendre après rafraîchissement.
        setErreurSaisie(erreurMutation.message);
      },
    };

    if (edition.itemId) {
      remplacement.mutate(
        {
          item_id: edition.itemId,
          etablissement_id: etablissementId,
          annee,
          type,
          valeur,
        },
        options,
      );
    } else {
      creation.mutate(
        { etablissement_id: etablissementId, annee, type, valeur },
        options,
      );
    }
  }

  function confirmerSuppression() {
    if (!itemASupprimer) return;
    const item = itemASupprimer;

    suppression.mutate(item.id, {
      onSuccess: () => {
        toast.success(`${libelleTypeItem(item.type)} supprimé`);
        setItemASupprimer(null);
      },
      onError: (erreurMutation: Error) => {
        toast.error(erreurMutation.message);
        setItemASupprimer(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {groupes.map((groupe) => {
        const item = groupe.item;
        const enEdition = edition?.type === groupe.type;

        return (
          <section
            key={groupe.type}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h4
                  className="text-[13.5px] font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {groupe.libelle}
                </h4>
                {groupe.description ? (
                  <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
                    {groupe.description}
                  </p>
                ) : null}
              </div>
              {item ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--status-actif-bg)] px-2.5 py-[3px] text-[11.5px] font-semibold text-[var(--status-actif-fg)]">
                  <CheckCircle2 className="h-3 w-3" />
                  Renseigné
                </span>
              ) : (
                <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--status-brouillon-bg)] px-2.5 py-[3px] text-[11.5px] font-semibold text-[var(--status-brouillon-fg)]">
                  À compléter
                </span>
              )}
            </header>

            {enEdition ? (
              <form
                onSubmit={enregistrer}
                className="mt-3 flex flex-col gap-2"
                noValidate
              >
                <label
                  htmlFor={`synthese-valeur-${groupe.type}`}
                  className="text-[12px] font-semibold text-[var(--color-text-secondary)]"
                >
                  Valeur — {groupe.libelle}
                </label>
                <textarea
                  id={`synthese-valeur-${groupe.type}`}
                  value={edition.valeur}
                  onChange={(evenement) => {
                    const valeur = evenement.target.value;
                    setEdition({ ...edition, valeur });
                    setErreurSaisie(validerValeurItem(valeur));
                  }}
                  rows={4}
                  autoFocus
                  aria-invalid={Boolean(erreurSaisie)}
                  className={`w-full rounded-[var(--radius-sm)] border bg-[var(--color-surface)] px-3 py-2 text-[13.5px] outline-none focus:border-[var(--color-brand)] ${
                    erreurSaisie
                      ? "border-[var(--status-expire-fg)]"
                      : "border-[var(--color-border)]"
                  }`}
                />
                {erreurSaisie ? (
                  <p
                    role="alert"
                    className="text-[11.5px] font-medium text-[var(--status-expire-fg)]"
                  >
                    {erreurSaisie}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={
                      enregistrementEnCours || Boolean(erreurValidationCourante)
                    }
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
                  >
                    {enregistrementEnCours ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={fermerEdition}
                    disabled={enregistrementEnCours}
                    className={CLASSE_BOUTON_SECONDAIRE}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <>
                {item ? (
                  <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-[var(--color-text-primary)]">
                    {item.valeur}
                  </p>
                ) : (
                  <p className="mt-2 text-[12.5px] italic text-[var(--color-text-secondary)]">
                    Non renseigné pour {annee}.
                  </p>
                )}

                {peutGerer ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item ? (
                      <>
                        <button
                          type="button"
                          onClick={() => ouvrirEdition(groupe.type, item)}
                          className={CLASSE_BOUTON_SECONDAIRE}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemASupprimer(item)}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--status-expire-fg)] hover:text-[var(--status-expire-fg)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => ouvrirEdition(groupe.type)}
                        className={CLASSE_BOUTON_SECONDAIRE}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Renseigner
                      </button>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </section>
        );
      })}

      <DestructiveConfirmDialog
        ouvert={itemASupprimer !== null}
        onFermer={() => setItemASupprimer(null)}
        onConfirmer={confirmerSuppression}
        titre="Supprimer cet élément de synthèse"
        description={`L'élément « ${itemASupprimer ? libelleTypeItem(itemASupprimer.type) : ""} » sera définitivement supprimé pour l'année ${annee}.`}
        nomCible={itemASupprimer ? libelleTypeItem(itemASupprimer.type) : ""}
        libelleAction="Supprimer"
        enCours={suppression.isPending}
      />
    </div>
  );
}
