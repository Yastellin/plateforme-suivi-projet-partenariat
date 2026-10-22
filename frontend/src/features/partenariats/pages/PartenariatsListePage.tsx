// src/features/partenariats/pages/PartenariatsListePage.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { Handshake, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePartenariats } from "../api/usePartenariats";
import { useSoumettreEnMassePartenariats } from "../api/useSoumettreEnMassePartenariats";
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
import {
  LIBELLES_DOMAINE_PARTENARIAT,
  LIBELLES_STATUT_PARTENARIAT,
} from "@/lib/status-mappings";

const LIMITE_PAR_PAGE = 20;

export function PartenariatsListePage() {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [modeSelection, setModeSelection] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const soumission = useSoumettreEnMassePartenariats();
  const { data, isLoading } = usePartenariats({
    page,
    limit: LIMITE_PAR_PAGE,
    recherche,
  });

  const role = utilisateur?.role;
  const cheminBase =
    role === "PRESIDENCE"
      ? "/presidence"
      : role === "ETABLISSEMENT"
        ? "/etablissement"
        : "/decideur";
  const cheminCreation = `${cheminBase}/partenaires-partenariats/partenariats/nouveau`;
  const partenariats = data?.data ?? [];
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
        description="Tous les partenariats de la plateforme."
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

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un partenariat…"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-12 w-full" />
            ))}
          </div>
        ) : partenariats.length === 0 ? (
          <EmptyState
            icone={Handshake}
            titre={
              recherche
                ? "Aucun résultat pour cette recherche"
                : "Aucun partenariat enregistré"
            }
            description={
              recherche
                ? "Essayez avec un autre terme de recherche."
                : "Les partenariats ajoutés apparaîtront ici."
            }
          />
        ) : (
          <PanelBody>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {modeSelection ? (
                      <th className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px]">
                        <input
                          type="checkbox"
                          checked={tousSoumissiblesSelectionnes}
                          onChange={basculerTout}
                          aria-label="Sélectionner tous les partenariats non soumis"
                        />
                      </th>
                    ) : null}
                    {[
                      "Intitulé",
                      "Domaine",
                      "Période",
                      "Établissements",
                      "Transmission",
                      "Statut",
                    ].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]"
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partenariats.map((partenariat) => {
                    const info =
                      LIBELLES_STATUT_PARTENARIAT[partenariat.statut];
                    const peutSelectionner =
                      partenariat.cree_par_role === "ETABLISSEMENT" &&
                      partenariat.statut === "BROUILLON" &&
                      !partenariat.soumis_le &&
                      !partenariat.publie_le;
                    return (
                      <tr
                        key={partenariat.id}
                        className="hover:bg-[var(--color-page-bg)]"
                      >
                        {modeSelection ? (
                          <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
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
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <Link
                            to={`${cheminBase}/partenaires-partenariats/partenariats/${partenariat.id}`}
                            className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                          >
                            {partenariat.intitule}
                          </Link>
                          {partenariat.partenaires.length > 0 ? (
                            <ul
                              className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary)]"
                              aria-label="Partenaires"
                            >
                              {partenariat.partenaires.map((partenaire) => (
                                <li
                                  key={partenaire.id}
                                  className="inline-flex items-center gap-1"
                                >
                                  <LogoMedia
                                    src={partenaire.logo_url}
                                    nom={partenaire.nom}
                                    className="h-4 w-4 shrink-0 rounded-sm bg-white object-contain text-[7px]"
                                    loading="lazy"
                                  />
                                  {partenaire.nom}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                          {LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}
                        </td>
                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] font-mono text-[12.5px]">
                          {formaterDate(partenariat.date_debut)}
                          {partenariat.date_fin
                            ? ` au ${formaterDate(partenariat.date_fin)}`
                            : ""}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                          {partenariat.etablissements.length > 0 ? (
                            <ul className="flex flex-wrap gap-x-2 gap-y-1">
                              {partenariat.etablissements.map(
                                (etablissement) => (
                                  <li
                                    key={etablissement.id}
                                    className="inline-flex items-center gap-1"
                                  >
                                    <LogoMedia
                                      src={etablissement.logo_url}
                                      nom={etablissement.nom}
                                      className="h-5 w-5 shrink-0 rounded bg-white object-contain text-[8px]"
                                      loading="lazy"
                                    />
                                    {etablissement.sigle ?? etablissement.nom}
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            "Aucun"
                          )}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-xs font-medium text-[var(--color-text-secondary)]">
                          {partenariat.publie_le
                            ? "Publié"
                            : partenariat.soumis_le
                              ? "Soumis à la Présidence"
                              : partenariat.cree_par_role === "PRESIDENCE"
                                ? "Donnée Présidence"
                                : "Non soumis"}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge
                            libelle={info.libelle}
                            tonalite={info.tonalite}
                          />
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
    </div>
  );
}
