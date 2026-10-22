import { useState } from "react";
import { History, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useHistorique,
  type ActionHistorique,
} from "@/features/historique/api/useHistorique";
import type { ToneStatut } from "@/lib/status-mappings";

const ACTIONS: Array<{
  valeur: ActionHistorique;
  libelle: string;
  tonalite: ToneStatut;
}> = [
  { valeur: "CREATION", libelle: "Création", tonalite: "actif" },
  { valeur: "MODIFICATION", libelle: "Modification", tonalite: "circuit" },
  { valeur: "SOUMISSION", libelle: "Soumission", tonalite: "attente" },
  { valeur: "PUBLICATION", libelle: "Publication", tonalite: "actif" },
  { valeur: "ARCHIVAGE", libelle: "Archivage", tonalite: "archive" },
  { valeur: "RESTAURATION", libelle: "Restauration", tonalite: "circuit" },
  { valeur: "SUPPRESSION", libelle: "Suppression", tonalite: "expire" },
];

const TYPES_ENTITE = [
  "Projet",
  "Partenaire",
  "Partenariat",
  "Convention",
  "CotutelleThese",
  "Document",
  "Etablissement",
  "Configuration",
  "Utilisateur",
];

const LIBELLES_ENTITE: Record<string, string> = {
  CotutelleThese: "Cotutelle",
  Configuration: "Configuration Présidence",
};

function infoAction(action: ActionHistorique) {
  return (
    ACTIONS.find((element) => element.valeur === action) ?? {
      libelle: action,
      tonalite: "archive" as const,
    }
  );
}

function formaterDate(date: string): string {
  return new Intl.DateTimeFormat("fr-MG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function HistoriquePage() {
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [action, setAction] = useState<ActionHistorique | "">("");
  const [entiteType, setEntiteType] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const rechercheDifferee = useDebounce(recherche, 300);

  const { data, isLoading, isError } = useHistorique({
    page,
    limit: 25,
    recherche: rechercheDifferee,
    action,
    entite_type: entiteType,
    date_debut: dateDebut,
    date_fin: dateFin,
  });

  return (
    <div>
      <PageHeader
        titre="Historique"
        description="Consultez les créations, modifications, soumissions, publications, archivages et restaurations."
      />

      <Panel>
        <div className="grid gap-3 border-b border-[var(--color-border)] p-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative md:col-span-2 xl:col-span-1">
            <span className="sr-only">Rechercher une entité</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <Input
              value={recherche}
              onChange={(evenement) => {
                setRecherche(evenement.target.value);
                setPage(1);
              }}
              placeholder="Rechercher une entité…"
              className="pl-9"
            />
          </label>

          <label>
            <span className="sr-only">Filtrer par action</span>
            <select
              value={action}
              onChange={(evenement) => {
                setAction(evenement.target.value as ActionHistorique | "");
                setPage(1);
              }}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
            >
              <option value="">Toutes les actions</option>
              {ACTIONS.map((element) => (
                <option key={element.valeur} value={element.valeur}>
                  {element.libelle}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filtrer par type d'entité</span>
            <select
              value={entiteType}
              onChange={(evenement) => {
                setEntiteType(evenement.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
            >
              <option value="">Toutes les entités</option>
              {TYPES_ENTITE.map((type) => (
                <option key={type} value={type}>
                  {LIBELLES_ENTITE[type] ?? type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span>Du</span>
            <Input
              type="date"
              value={dateDebut}
              max={dateFin || undefined}
              onChange={(evenement) => {
                setDateDebut(evenement.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span>Au</span>
            <Input
              type="date"
              value={dateFin}
              min={dateDebut || undefined}
              onChange={(evenement) => {
                setDateFin(evenement.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        <PanelBody className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[0, 1, 2, 3, 4].map((ligne) => (
                <Skeleton key={ligne} className="h-14 w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icone={History}
              titre="Historique indisponible"
              description="La consultation de l'historique a échoué. Réessayez après avoir vérifié que l'API est à jour."
            />
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icone={History}
              titre="Aucune action trouvée"
              description="Aucune action ne correspond aux filtres sélectionnés."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[var(--color-page-bg)] text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entité</th>
                    <th className="px-4 py-3">Élément</th>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((entree) => {
                    const information = infoAction(entree.action);
                    return (
                      <tr
                        key={entree.id}
                        className="border-t border-[var(--color-border)] align-top"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                          {formaterDate(entree.date_creation)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            libelle={information.libelle}
                            tonalite={information.tonalite}
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {LIBELLES_ENTITE[entree.entite_type] ??
                            entree.entite_type}
                        </td>
                        <td className="max-w-56 px-4 py-3 font-medium">
                          <span className="line-clamp-2">
                            {entree.entite_nom ?? "Élément sans libellé"}
                          </span>
                        </td>
                        <td className="max-w-56 px-4 py-3">
                          <span className="block truncate">
                            {entree.utilisateur_nom ?? "Système"}
                          </span>
                          {entree.utilisateur_role ? (
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              {entree.utilisateur_role}
                            </span>
                          ) : null}
                        </td>
                        <td className="max-w-72 px-4 py-3 text-[var(--color-text-secondary)]">
                          <span className="line-clamp-2">
                            {entree.details ?? "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </PanelBody>

        {data?.meta ? (
          <TablePagination meta={data.meta} onChangerPage={setPage} />
        ) : null}
      </Panel>
    </div>
  );
}
