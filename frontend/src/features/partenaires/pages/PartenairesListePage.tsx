// src/features/partenaires/pages/PartenairesListePage.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Handshake } from "lucide-react";
import { toast } from "sonner";
import { usePartenaires } from "../api/usePartenaires";
import { useSoumettreEnMassePartenaires } from "../api/useSoumettreEnMassePartenaires";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ActionsSoumissionMasse } from "@/components/shared/ActionsSoumissionMasse";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { LogoMedia } from "@/components/shared/ImageMedia";

const LIMITE_PAR_PAGE = 20;

export function PartenairesListePage() {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [modeSelection, setModeSelection] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const soumission = useSoumettreEnMassePartenaires();
  const { data, isLoading } = usePartenaires({
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
  const partenaires = data?.data ?? [];
  const soumissibles = partenaires.filter(
    (partenaire) =>
      partenaire.cree_par_role === "ETABLISSEMENT" &&
      !partenaire.soumis_le &&
      !partenaire.publie_le,
  );
  const tousSoumissiblesSelectionnes =
    soumissibles.length > 0 &&
    soumissibles.every((partenaire) => selection.has(partenaire.id));

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
      if (soumissibles.every((partenaire) => suivante.has(partenaire.id))) {
        soumissibles.forEach((partenaire) => suivante.delete(partenaire.id));
      } else {
        soumissibles.forEach((partenaire) => suivante.add(partenaire.id));
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
        `${resultat.reussis.length} partenaire${resultat.reussis.length > 1 ? "s" : ""} soumis`,
      );
      if (resultat.echecs.length)
        toast.warning(`${resultat.echecs.length} partenaire(s) non soumis`);
    } catch (erreur) {
      toast.error(
        erreur instanceof Error ? erreur.message : "La soumission a échoué.",
      );
    }
  }

  return (
    <div>
      <PageHeader
        titre="Partenaires"
        description="Tous les partenaires de la plateforme."
        actions={
          <>
            {permissions.peutCreer ? (
              <Link
                to={`${cheminBase}/partenaires-partenariats/partenaires/nouveau`}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
              >
                <Plus className="h-3.5 w-3.5" /> Nouveau partenaire
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
          placeholderRecherche="Rechercher un partenaire…"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-12 w-full" />
            ))}
          </div>
        ) : partenaires.length === 0 ? (
          <EmptyState
            icone={Handshake}
            titre={
              recherche
                ? "Aucun résultat pour cette recherche"
                : "Aucun partenaire enregistré"
            }
            description={
              recherche
                ? "Essayez avec un autre terme de recherche."
                : "Les partenaires ajoutés apparaîtront ici."
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
                          aria-label="Sélectionner tous les partenaires non soumis"
                        />
                      </th>
                    ) : null}
                    {[
                      "Partenaire",
                      "Type",
                      "Pays",
                      "État de transmission",
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
                  {partenaires.map((partenaire) => (
                    <tr
                      key={partenaire.id}
                      className="hover:bg-[var(--color-page-bg)]"
                    >
                      {modeSelection ? (
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          {partenaire.cree_par_role === "ETABLISSEMENT" &&
                          !partenaire.soumis_le &&
                          !partenaire.publie_le ? (
                            <input
                              type="checkbox"
                              checked={selection.has(partenaire.id)}
                              onChange={() => basculer(partenaire.id)}
                              aria-label={`Sélectionner ${partenaire.nom}`}
                            />
                          ) : null}
                        </td>
                      ) : null}
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                        <Link
                          to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                          className="flex items-center gap-3 font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                        >
                          <LogoMedia
                            src={partenaire.logo_url}
                            nom={partenaire.nom}
                            className="h-9 w-9 flex-shrink-0 rounded-md border border-[var(--color-border)] object-contain text-xs"
                            loading="lazy"
                          />
                          {partenaire.nom}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {partenaire.type}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {partenaire.pays}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                          {partenaire.publie_le
                            ? "Publié"
                            : partenaire.soumis_le
                              ? "Soumis à la Présidence"
                              : partenaire.cree_par_role === "PRESIDENCE"
                                ? "Donnée Présidence"
                                : "Non soumis"}
                        </span>
                      </td>
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                        <StatusBadge
                          libelle={
                            partenaire.statut === "ACTIF" ? "Actif" : "Suspendu"
                          }
                          tonalite={
                            partenaire.statut === "ACTIF" ? "actif" : "attente"
                          }
                        />
                      </td>
                    </tr>
                  ))}
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
