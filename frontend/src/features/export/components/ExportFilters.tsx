import { Check, ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FiltresExport } from "../types/export.types";
import {
  CHAMPS_DATE_EXPORT,
  FORMATS_EXPORT,
  MODES_PERIODE_EXPORT,
  PORTÉES_EXPORT,
  STATUTS_EXPORT,
} from "../types/export.types";
import {
  LIBELLES_FORMAT,
  LIBELLES_PORTEE,
  LIBELLES_STATUT,
} from "../lib/export.utils";

const TITRES_PERIODE: Record<(typeof MODES_PERIODE_EXPORT)[number], string> = {
  TOUT: "Toutes les périodes",
  ANNEE: "Année",
  MOIS: "Mois",
  INTERVALLE: "Intervalle",
};

const TITRES_CHAMP_DATE: Record<(typeof CHAMPS_DATE_EXPORT)[number], string> = {
  SIGNATURE: "Date de signature",
  DEBUT: "Date de début",
  FIN: "Date de fin",
};

const ICONES_PORTEE: Record<(typeof PORTÉES_EXPORT)[number], string> = {
  TOUT: "4",
  CONVENTIONS: "C",
  PROJETS: "P",
  PARTENARIATS: "PA",
  PARTENAIRES: "PR",
};

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const CLASSE_SELECT =
  "h-10 w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 pr-10 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60";
const CLASSE_CHAMP =
  "mb-2 block text-sm font-semibold text-[var(--color-text-primary)]";
const CLASSE_SECTION =
  "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5";

export function ExportFilters() {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<FiltresExport>();
  const valeurs = watch();
  const seulementPartenaires = valeurs.portee === "PARTENAIRES";
  const anneeCourante = new Date().getFullYear();
  const annees = Array.from({ length: 6 }, (_, index) => anneeCourante - index);

  function basculerStatut(
    statut: (typeof STATUTS_EXPORT)[number],
    coche: boolean,
  ) {
    const actuels = getValues("statuts");
    const prochains = coche
      ? [...new Set([...actuels, statut])]
      : actuels.filter((element) => element !== statut);
    setValue("statuts", prochains, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="space-y-4">
      <fieldset className={CLASSE_SECTION}>
        <legend className="px-1 text-base font-bold text-[var(--color-text-primary)]">
          Portée des données
        </legend>
        <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
          Choisissez les données à inclure dans le fichier.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PORTÉES_EXPORT.map((portee) => {
            const selectionnee = valeurs.portee === portee;
            return (
              <label
                key={portee}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-[var(--color-brand)] ${selectionnee ? "border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_9%,var(--color-surface))]" : "border-[var(--color-border)] hover:bg-[var(--color-page-bg)]"}`}
              >
                <input
                  type="radio"
                  value={portee}
                  className="sr-only"
                  {...register("portee")}
                />
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selectionnee ? "bg-[var(--color-brand)] text-[var(--color-brand-text)]" : "bg-[var(--color-page-bg)] text-[var(--color-text-secondary)]"}`}
                >
                  {ICONES_PORTEE[portee]}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {LIBELLES_PORTEE[portee]}
                  {portee === "TOUT" ? (
                    <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-secondary)]">
                      Conventions, projets, partenariats et partenaires
                    </span>
                  ) : null}
                </span>
                {selectionnee ? (
                  <Check
                    aria-hidden="true"
                    size={17}
                    className="text-[var(--color-brand)]"
                  />
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={CLASSE_SECTION}>
        <legend className="px-1 text-base font-bold text-[var(--color-text-primary)]">
          Période
        </legend>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Filtrez les lignes par une date de référence.
        </p>
        <label className={CLASSE_CHAMP} htmlFor="export-mode-periode">
          Période
        </label>
        <div className="relative">
          <select
            id="export-mode-periode"
            className={CLASSE_SELECT}
            {...register("periode.mode")}
          >
            {MODES_PERIODE_EXPORT.map((mode) => (
              <option key={mode} value={mode}>
                {TITRES_PERIODE[mode]}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 size-4 text-[var(--color-text-secondary)]"
          />
        </div>

        {valeurs.periode.mode !== "TOUT" ? (
          <div className="mt-4">
            <label className={CLASSE_CHAMP} htmlFor="export-champ-date">
              Date utilisée
            </label>
            <div className="relative">
              <select
                id="export-champ-date"
                className={CLASSE_SELECT}
                {...register("periode.champ_date")}
              >
                {CHAMPS_DATE_EXPORT.map((champ) => (
                  <option key={champ} value={champ}>
                    {TITRES_CHAMP_DATE[champ]}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-3 size-4 text-[var(--color-text-secondary)]"
              />
            </div>
            {valeurs.portee === "TOUT" ||
            valeurs.portee === "PROJETS" ||
            valeurs.portee === "PARTENARIATS" ||
            valeurs.portee === "PARTENAIRES" ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Pour les projets, partenariats et partenaires, « Date de
                signature » utilise leur date d’enregistrement. Les partenaires
                utilisent toujours cette date comme référence, quel que soit le
                champ choisi.
              </p>
            ) : null}
          </div>
        ) : null}

        {valeurs.periode.mode === "ANNEE" || valeurs.periode.mode === "MOIS" ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={CLASSE_CHAMP} htmlFor="export-annee">
                Année
              </label>
              <select
                id="export-annee"
                className={CLASSE_SELECT}
                {...register("periode.annee", { valueAsNumber: true })}
              >
                {annees.map((annee) => (
                  <option value={annee} key={annee}>
                    {annee}
                  </option>
                ))}
              </select>
              {errors.periode?.annee?.message ? (
                <p
                  role="alert"
                  className="mt-1 text-xs text-[var(--chart-error)]"
                >
                  {errors.periode.annee.message}
                </p>
              ) : null}
            </div>
            {valeurs.periode.mode === "MOIS" ? (
              <div>
                <label className={CLASSE_CHAMP} htmlFor="export-mois">
                  Mois
                </label>
                <select
                  id="export-mois"
                  className={CLASSE_SELECT}
                  {...register("periode.mois", { valueAsNumber: true })}
                >
                  {MOIS.map((mois, index) => (
                    <option value={index} key={mois}>
                      {mois}
                    </option>
                  ))}
                </select>
                {errors.periode?.mois?.message ? (
                  <p
                    role="alert"
                    className="mt-1 text-xs text-[var(--chart-error)]"
                  >
                    {errors.periode.mois.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {valeurs.periode.mode === "INTERVALLE" ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={CLASSE_CHAMP} htmlFor="export-date-du">
                Du
              </label>
              <Input
                id="export-date-du"
                type="date"
                aria-invalid={Boolean(errors.periode?.du)}
                {...register("periode.du")}
              />
              {errors.periode?.du?.message ? (
                <p
                  role="alert"
                  className="mt-1 text-xs text-[var(--chart-error)]"
                >
                  {errors.periode.du.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className={CLASSE_CHAMP} htmlFor="export-date-au">
                Au
              </label>
              <Input
                id="export-date-au"
                type="date"
                aria-invalid={Boolean(errors.periode?.au)}
                {...register("periode.au")}
              />
              {errors.periode?.au?.message ? (
                <p
                  role="alert"
                  className="mt-1 text-xs text-[var(--chart-error)]"
                >
                  {errors.periode.au.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </fieldset>

      <fieldset className={CLASSE_SECTION}>
        <legend className="px-1 text-base font-bold text-[var(--color-text-primary)]">
          Statuts
        </legend>
        <div className="mb-3 rounded-lg border border-[var(--status-attente-fg)]/30 bg-[var(--status-attente-bg)] p-3 text-xs leading-relaxed text-[var(--status-attente-fg)]">
          <p className="font-semibold">Calcul du filtre « En retard »</p>
          <p className="mt-1">
            Conventions : statut « Expirée » ou date de fin antérieure à
            l’instant présent, sans exclusion de statut. Projets : date de fin
            prévue antérieure à l’instant présent, sauf Brouillon, Terminé ou
            Expiré; Suspendu reste inclus, comme au tableau de bord.
            Partenariats : aucun calcul « En retard » n’existe actuellement, ce
            filtre n’ajoute donc aucune ligne.
          </p>
        </div>
        {seulementPartenaires ? (
          <p className="mb-3 rounded-lg bg-[var(--color-page-bg)] p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Les partenaires ne sont pas filtrés par statut. Les options sont
            donc sans effet pour cette portée.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue("statuts", [...STATUTS_EXPORT], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                Tout sélectionner
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue("statuts", [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                Effacer la sélection
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STATUTS_EXPORT.map((statut) => {
                const coche = valeurs.statuts.includes(statut);
                return (
                  <label
                    key={statut}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-[var(--color-brand)] ${coche ? "border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface))]" : "border-[var(--color-border)] hover:bg-[var(--color-page-bg)]"}`}
                  >
                    <input
                      type="checkbox"
                      checked={coche}
                      onChange={(event) =>
                        basculerStatut(statut, event.target.checked)
                      }
                      className="size-4 accent-[var(--color-brand)]"
                    />
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {LIBELLES_STATUT[statut]}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              Les statuts Brouillon et En attente (y compris En attente de
              signature pour les conventions) ne sont inclus que lorsque les
              cinq filtres sont cochés. Les partenaires ne sont jamais filtrés
              par statut; une sélection vide donne un aperçu vide.
            </p>
          </>
        )}
      </fieldset>

      <fieldset className={CLASSE_SECTION}>
        <legend className="px-1 text-base font-bold text-[var(--color-text-primary)]">
          Format
        </legend>
        <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
          Un fichier unique pour Excel et PDF; un ZIP contenant les CSV et les
          informations pour CSV.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {FORMATS_EXPORT.map((format) => {
            const selectionne = valeurs.format === format;
            const descriptions = {
              XLSX: "Classeur multi-feuilles",
              CSV: "Archive ZIP de fichiers CSV",
              PDF: "Rapport PDF paginé",
            } as const;
            return (
              <label
                key={format}
                className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-[var(--color-brand)] ${selectionne ? "border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface))]" : "border-[var(--color-border)] hover:bg-[var(--color-page-bg)]"}`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={format}
                    className="size-4 accent-[var(--color-brand)]"
                    {...register("format")}
                  />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {LIBELLES_FORMAT[format]}
                  </span>
                </span>
                <span className="pl-6 text-xs text-[var(--color-text-secondary)]">
                  {descriptions[format]}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
