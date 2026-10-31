// src/features/partenariats/pages/PartenariatsListePage.tsx

import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Archive, ArrowUpDown, Handshake, Pencil, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { usePartenariats } from "../api/usePartenariats";
import { useArchiverPartenariat } from "../api/useArchiverPartenariat";
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog";
import { useSoumettreEnMassePartenariats } from "../api/useSoumettreEnMassePartenariats";
import { useEtablissements } from "@/features/etablissements/api/useEtablissements";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LogoMedia } from "@/components/shared/ImageMedia";
import { ActionsSoumissionMasse } from "@/components/shared/ActionsSoumissionMasse";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { formaterDate } from "@/lib/format";
import { filtrerListeGenerale } from "@/lib/perimetre-liste";
import { cn } from "@/lib/utils";
import {
  LIBELLES_DOMAINE_PARTENARIAT,
  LIBELLES_STATUT_PARTENARIAT,
} from "@/lib/status-mappings";
import type { Partenariat } from "@/types/api";
import { LienDocumentsEntite } from "@/features/documents/components/LienDocumentsEntite";

const LIMITE_PAR_PAGE = 20;

const STATUTS = ["BROUILLON", "EN_ATTENTE", "EN_COURS", "SUSPENDU", "TERMINE"] as const;
const DOMAINES = [
  "RECHERCHE",
  "FORMATION",
  "INNOVATION",
  "DEVELOPPEMENT",
  "COOPERATION_INSTITUTIONNELLE",
  "AUTRE",
] as const;

// Transmission : où en est le partenariat côté vitrine / Présidence
function transmission(partenariat: Partenariat): { libelle: string; classe: string } {
  if (partenariat.publie_le) {
    return {
      libelle: "Vitrine",
      classe: "bg-[var(--status-actif-bg)] text-[var(--status-actif-fg)]",
    };
  }
  if (partenariat.soumis_le) {
    return {
      libelle: "Soumis",
      classe: "bg-[var(--status-attente-bg)] text-[var(--status-attente-fg)]",
    };
  }
  if (partenariat.cree_par_role === "PRESIDENCE") {
    return {
      libelle: "Présidence",
      classe: "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
    };
  }
  return {
    libelle: "Non soumis",
    classe: "bg-[var(--status-brouillon-bg)] text-[var(--status-brouillon-fg)]",
  };
}

export function PartenariatsListePage() {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [domaine, setDomaine] = useState("");
  const [etablissementId, setEtablissementId] = useState("");
  const [modeSelection, setModeSelection] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [aArchiver, setAArchiver] = useState<Partenariat | null>(null);
  const archiver = useArchiverPartenariat();
  const soumission = useSoumettreEnMassePartenariats();
  const { data, isLoading } = usePartenariats({
    page,
    limit: LIMITE_PAR_PAGE,
    recherche,
    statut,
    domaine,
    etablissement_id: etablissementId,
  });

  const role = utilisateur?.role;
  const peutFiltrerParEtablissement = role !== "ETABLISSEMENT";
  const { data: etablissementsPage } = useEtablissements({ page: 1, limit: 100 });
  const etablissements = etablissementsPage?.data ?? [];

  const cheminBase =
    role === "PRESIDENCE"
      ? "/presidence"
      : role === "ETABLISSEMENT"
        ? "/etablissement"
        : "/decideur";
  const cheminCreation = `${cheminBase}/partenaires-partenariats/partenariats/nouveau`;
  const peutConsulterDocuments = permissions.estPresidence || permissions.estDecideur;
  // Même règle que la fiche détail : Présidence, ou brouillon créé par l'établissement
  const peutModifierLigne = (partenariat: Partenariat) =>
    permissions.estPresidence ||
    (role === "ETABLISSEMENT" &&
      partenariat.cree_par_role === "ETABLISSEMENT" &&
      partenariat.statut === "BROUILLON");
  const partenariats = filtrerListeGenerale(data?.data ?? [], role);
  const soumissibles = partenariats.filter(
    (item) =>
      item.cree_par_role === "ETABLISSEMENT" &&
      item.statut === "BROUILLON" &&
      !item.soumis_le &&
      !item.publie_le,
  );
  const tousSoumissiblesSelectionnes =
    soumissibles.length > 0 &&
    soumissibles.every((partenariat) => selection.has(partenariat.id));
  const filtresActifs = Boolean(recherche || statut || domaine || etablissementId);

  function reinitialiserFiltres() {
    setRecherche("");
    setStatut("");
    setDomaine("");
    setEtablissementId("");
    setPage(1);
  }

  function basculer(id: string) {
    setSelection((courante) => {
      const suivante = new Set(courante);
      if (suivante.has(id)) suivante.delete(id);
      else suivante.add(id);
      return suivante;
    });
  }

  function basculerTout() {
    setSelection((courante) => {
      const suivante = new Set(courante);
      if (soumissibles.every((partenariat) => suivante.has(partenariat.id))) {
        soumissibles.forEach((partenariat) => suivante.delete(partenariat.id));
      } else {
        soumissibles.forEach((partenariat) => suivante.add(partenariat.id));
      }
      return suivante;
    });
  }

  async function soumettreSelection() {
    try {
      const resultat = await soumission.mutateAsync([...selection]);
      setSelection(new Set());
      setModeSelection(false);
      toast.success(
        `${resultat.reussis.length} partenariat${resultat.reussis.length > 1 ? "s" : ""} soumis`,
      );
      if (resultat.echecs.length)
        toast.warning(`${resultat.echecs.length} partenariat(s) non soumis`);
    } catch (erreur) {
      toast.error(
        erreur instanceof Error ? erreur.message : "La soumission a échoué.",
      );
    }
  }

  return (
    <div>
      <PageHeader
        titre="Partenariats"
        description={
          role === "PRESIDENCE"
            ? "Partenariats créés et gérés par la Présidence. Les partenariats des établissements restent dans leurs fiches dédiées."
            : "Partenariats accessibles dans votre périmètre."
        }
        actions={
          <>
            {permissions.peutCreer ? (
              <Link
                to={cheminCreation}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
              >
                <Plus className="h-3.5 w-3.5" /> Nouveau partenariat
              </Link>
            ) : null}
            {permissions.peutSoumettre &&
            (soumissibles.length > 0 || selection.size > 0) ? (
              <ActionsSoumissionMasse
                actif={modeSelection}
                nombreSelectionne={selection.size}
                enCours={soumission.isPending}
                onActiver={() => setModeSelection(true)}
                onAnnuler={() => {
                  setModeSelection(false);
                  setSelection(new Set());
                }}
                onSoumettre={() => void soumettreSelection()}
              />
            ) : null}
          </>
        }
      />

      <Panel className="overflow-hidden">
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un partenariat…"
          enfants={
            <div className="flex flex-wrap items-center gap-2">
              <FiltreSelect
                libelle="Statut"
                valeur={statut}
                onChange={(valeur) => {
                  setStatut(valeur);
                  setPage(1);
                }}
                options={STATUTS.map((s) => ({ valeur: s, libelle: LIBELLES_STATUT_PARTENARIAT[s].libelle }))}
              />
              <FiltreSelect
                libelle="Domaine"
                valeur={domaine}
                onChange={(valeur) => {
                  setDomaine(valeur);
                  setPage(1);
                }}
                options={DOMAINES.map((d) => ({ valeur: d, libelle: LIBELLES_DOMAINE_PARTENARIAT[d] }))}
              />
              {peutFiltrerParEtablissement ? (
                <FiltreSelect
                  libelle="Établissement"
                  valeur={etablissementId}
                  onChange={(valeur) => {
                    setEtablissementId(valeur);
                    setPage(1);
                  }}
                  options={etablissements.map((e) => ({ valeur: e.id, libelle: e.sigle ?? e.nom }))}
                />
              ) : null}
              {filtresActifs ? (
                <button
                  type="button"
                  onClick={reinitialiserFiltres}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12.5px] font-semibold text-[var(--color-brand)] hover:bg-[var(--color-active-zone)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
                </button>
              ) : null}
            </div>
          }
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-14 w-full" />
            ))}
          </div>
        ) : partenariats.length === 0 ? (
          <EmptyState
            icone={Handshake}
            titre={
              filtresActifs
                ? "Aucun partenariat ne correspond aux filtres"
                : "Aucun partenariat enregistré"
            }
            description={
              filtresActifs
                ? "Modifiez ou réinitialisez les filtres pour voir d'autres résultats."
                : "Les partenariats ajoutés apparaîtront ici."
            }
          />
        ) : (
          <PanelBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
                    {modeSelection ? (
                      <th className="w-10 px-5 py-3">
                        <input
                          type="checkbox"
                          checked={tousSoumissiblesSelectionnes}
                          onChange={basculerTout}
                          aria-label="Sélectionner tous les partenariats non soumis"
                        />
                      </th>
                    ) : null}
                    <Th>Intitulé</Th>
                    <Th>Domaine</Th>
                    <Th>Période</Th>
                    <Th>Établissements</Th>
                    <Th>Transmission</Th>
                    <Th>Statut</Th>
                    <th scope="col" className="whitespace-nowrap px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {partenariats.map((partenariat) => {
                    const info = LIBELLES_STATUT_PARTENARIAT[partenariat.statut];
                    const trans = transmission(partenariat);
                    const peutSelectionner =
                      partenariat.cree_par_role === "ETABLISSEMENT" &&
                      partenariat.statut === "BROUILLON" &&
                      !partenariat.soumis_le &&
                      !partenariat.publie_le;
                    return (
                      <tr key={partenariat.id} className="transition-colors hover:bg-[var(--color-page-bg)]">
                        {modeSelection ? (
                          <td className="px-5 py-4">
                            {peutSelectionner ? (
                              <input
                                type="checkbox"
                                checked={selection.has(partenariat.id)}
                                onChange={() => basculer(partenariat.id)}
                                aria-label={`Sélectionner ${partenariat.intitule}`}
                              />
                            ) : null}
                          </td>
                        ) : null}

                        <td className="max-w-[320px] px-5 py-4">
                          <Link
                            to={`${cheminBase}/partenaires-partenariats/partenariats/${partenariat.id}`}
                            className="line-clamp-2 break-words font-semibold leading-5 text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                          >
                            {partenariat.intitule}
                          </Link>
                          {partenariat.partenaires.length > 0 ? (
                            <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Partenaires">
                              {partenariat.partenaires.map((partenaire) => (
                                <li
                                  key={partenaire.id}
                                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-[var(--color-page-bg)] px-1.5 py-0.5 text-[12px] text-[var(--color-text-secondary)]"
                                >
                                  <LogoMedia
                                    src={partenaire.logo_url}
                                    nom={partenaire.nom}
                                    className="h-3.5 w-3.5 shrink-0 rounded-sm bg-white object-contain text-[7px]"
                                    loading="lazy"
                                  />
                                  <span className="truncate">{partenaire.nom}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-md bg-[var(--color-active-zone)] px-2 py-0.5 text-[12.5px] font-medium text-[var(--color-brand)]">
                            {LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                          <div className="flex flex-col gap-0.5 text-[13px]">
                            <span className="text-[var(--color-text-primary)]">
                              <span className="text-[var(--color-text-secondary)]">Du </span>
                              {formaterDate(partenariat.date_debut)}
                            </span>
                            <span className="text-[var(--color-text-secondary)]">
                              {partenariat.date_fin ? `Au ${formaterDate(partenariat.date_fin)}` : "Sans échéance"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {partenariat.etablissements.length > 0 ? (
                            <ul className="flex flex-wrap gap-1.5">
                              {partenariat.etablissements.map((etablissement) => (
                                <li
                                  key={etablissement.id}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 py-0.5 text-[12.5px] font-medium text-[var(--color-text-primary)]"
                                >
                                  <LogoMedia
                                    src={etablissement.logo_url}
                                    nom={etablissement.nom}
                                    className="h-4 w-4 shrink-0 rounded bg-white object-contain text-[8px]"
                                    loading="lazy"
                                  />
                                  {etablissement.sigle ?? etablissement.nom}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[var(--color-text-secondary)]">Aucun</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className={cn("inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-semibold", trans.classe)}>
                            {trans.libelle}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge libelle={info.libelle} tonalite={info.tonalite} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            {peutConsulterDocuments ? (
                              <LienDocumentsEntite
                                entite="partenariat"
                                id={partenariat.id}
                                nom={partenariat.intitule}
                                cheminBase={cheminBase}
                              />
                            ) : null}
                            {peutModifierLigne(partenariat) ? (
                              <Link
                                to={`${cheminBase}/partenaires-partenariats/partenariats/${partenariat.id}`}
                                aria-label={`Modifier ${partenariat.intitule}`}
                                title="Modifier"
                                className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            ) : null}
                            {permissions.estPresidence ? (
                              <button
                                type="button"
                                aria-label={`Archiver ${partenariat.intitule}`}
                                title="Archiver"
                                onClick={() => setAArchiver(partenariat)}
                                className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--status-expire-fg)]"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data?.meta ? (
              <TablePagination meta={data.meta} onChangerPage={setPage} />
            ) : null}
          </PanelBody>
        )}
      </Panel>

      {aArchiver ? (
        <DestructiveConfirmDialog
          ouvert
          onFermer={() => setAArchiver(null)}
          onConfirmer={() =>
            archiver.mutate(aArchiver.id, {
              onSuccess: () => {
                toast.success("Partenariat archivé");
                setAArchiver(null);
              },
              onError: (erreur: Error) => toast.error(erreur.message),
            })
          }
          titre="Archiver ce partenariat ?"
          description="Cette action retire le partenariat des listes actives. Il restera consultable dans les archives."
          nomCible={aArchiver.intitule}
          libelleAction="Archiver"
          enCours={archiver.isPending}
        />
      ) : null}
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th scope="col" className="whitespace-nowrap px-5 py-3 font-semibold">
      <span className="inline-flex items-center gap-1.5">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />
      </span>
    </th>
  );
}

function FiltreSelect({
  libelle,
  valeur,
  onChange,
  options,
}: {
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  options: { valeur: string; libelle: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--color-text-secondary)]">
      <span className="sr-only sm:not-sr-only">{libelle}</span>
      <select
        value={valeur}
        onChange={(evenement) => onChange(evenement.target.value)}
        aria-label={libelle}
        className={cn(
          "h-8 max-w-[200px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]",
          valeur && "border-[var(--color-brand)]",
        )}
      >
        <option value="">Tous</option>
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </label>
  );
}
