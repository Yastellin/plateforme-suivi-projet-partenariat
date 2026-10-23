// src/features/etablissements/pages/EtablissementsListePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

import { DataTable, type Colonne } from "@/components/shared/DataTable";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { EmptyState } from "@/components/shared/EmptyState";
import { LogoMedia } from "@/components/shared/ImageMedia";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { useEtablissements } from "@/features/etablissements/api/useEtablissements";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import type { Etablissement } from "@/types/api";

const COLONNES: Colonne<Etablissement>[] = [
  {
    id: "nom",
    header: "Nom",
    cell: (e) => (
      <span className="flex items-center gap-2.5 font-medium text-[var(--color-text-primary)]">
        <LogoMedia
          src={e.logo_url}
          nom={e.nom}
          className="h-8 w-8 shrink-0 rounded-md border border-[var(--color-border)] bg-white object-contain p-0.5 text-[10px]"
          loading="lazy"
        />
        {e.nom}
      </span>
    ),
    primaire: true,
  },
  {
    id: "sigle",
    header: "Sigle",
    cell: (e) => (
      <span className="font-mono text-[12.5px] text-[var(--color-text-secondary)]">
        {e.sigle ?? "—"}
      </span>
    ),
  },
  {
    id: "description",
    header: "Description",
    cell: (e) => (
      <span className="text-[var(--color-text-secondary)] line-clamp-1">
        {e.description ?? "—"}
      </span>
    ),
  },
];

export function EtablissementsListePage() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const cheminBase =
    utilisateur?.role === "DECIDEUR" ? "/decideur" : "/presidence";
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const rechercheDebouncee = useDebounce(recherche, 300);

  const { data, isLoading } = useEtablissements({
    page,
    limit: 25,
    recherche: rechercheDebouncee || undefined,
  });

  return (
    <div>
      <PageHeader
        titre="Établissements"
        description={
          data
            ? `${data.meta.total} établissement${data.meta.total > 1 ? "s" : ""} enregistré${data.meta.total > 1 ? "s" : ""}`
            : "Chargement…"
        }
      />

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un établissement…"
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <div
                key={cle}
                className="h-12 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]"
              />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icone={Building2}
            titre="Aucun établissement"
            description="Aucun établissement n'est enregistré."
          />
        ) : (
          <PanelBody>
            <DataTable
              colonnes={COLONNES}
              donnees={data.data}
              meta={data.meta}
              onPageChange={setPage}
              onLigneClick={(e) =>
                navigate(`${cheminBase}/etablissements/${e.id}`)
              }
            />
          </PanelBody>
        )}
      </Panel>
    </div>
  );
}
