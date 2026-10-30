// src/features/etablissements/pages/EtablissementsListePage.tsx

import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, Building2, Eye, FolderKanban, Handshake, Network } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { LogoMedia } from "@/components/shared/ImageMedia";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { TablePagination } from "@/components/shared/TablePagination";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { useEtablissements } from "@/features/etablissements/api/useEtablissements";
import { useComparatifEtablissements } from "@/features/tableau-de-bord/api/useComparatifEtablissements";
import { CarteIndicateur } from "@/features/tableau-de-bord/components/CarteIndicateur";
import {
  FiltreTypeStatistique,
  type TypeStatistique,
} from "@/features/etablissements/components/FiltreTypeStatistique";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { ComparatifEtablissement, Etablissement } from "@/types/api";

const initiales = (nom: string) => {
  const morceaux = nom.trim().split(/\s+/).filter(Boolean);
  if (morceaux.length >= 2) return `${morceaux[0][0]}${morceaux[1][0]}`.toUpperCase();
  return (morceaux[0] ?? "?").slice(0, 2).toUpperCase();
};

export function EtablissementsListePage() {
  const { utilisateur } = useAuth();
  const cheminBase = utilisateur?.role === "DECIDEUR" ? "/decideur" : "/presidence";
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [filtre, setFiltre] = useState<TypeStatistique>("tous");
  const rechercheDebouncee = useDebounce(recherche, 300);

  const { data, isLoading } = useEtablissements({
    page,
    limit: 12,
    recherche: rechercheDebouncee || undefined,
  });
  const { data: comparatif } = useComparatifEtablissements();

  const statistiques = useMemo(
    () => new Map((comparatif ?? []).map((item) => [item.etablissement_id, item])),
    [comparatif],
  );

  // Totaux de la plateforme (tous établissements confondus)
  const totaux = useMemo(() => {
    const liste = comparatif ?? [];
    const somme = (cle: "projets" | "projets_actifs" | "partenaires" | "partenariats") =>
      liste.reduce((acc, item) => acc + (item[cle] ?? 0), 0);
    return {
      etablissements: liste.length,
      projets: somme("projets"),
      projetsActifs: somme("projets_actifs"),
      partenaires: somme("partenaires"),
      partenariats: somme("partenariats"),
      maxProjets: Math.max(1, ...liste.map((item) => item.projets ?? 0)),
      maxPartenaires: Math.max(1, ...liste.map((item) => item.partenaires ?? 0)),
    };
  }, [comparatif]);

  const etablissements = data?.data ?? [];

  // Colonnes numériques visibles selon le filtre
  const afficheProjets = filtre !== "partenaires";
  const affichePartenaires = filtre !== "projets";

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

      <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteIndicateur
          titre="Établissements"
          valeur={totaux.etablissements}
          icone={<Building2 className="h-[18px] w-[18px]" />}
          theme="violet"
          pied="Enregistrés sur la plateforme"
        />
        <CarteIndicateur
          titre="Projets"
          valeur={totaux.projets}
          icone={<FolderKanban className="h-[18px] w-[18px]" />}
          theme="blue"
          pied={`${totaux.projetsActifs} en cours`}
        />
        <CarteIndicateur
          titre="Partenaires"
          valeur={totaux.partenaires}
          icone={<Handshake className="h-[18px] w-[18px]" />}
          theme="emerald"
          pied="Soumis par les établissements"
        />
        <CarteIndicateur
          titre="Partenariats"
          valeur={totaux.partenariats}
          icone={<Network className="h-[18px] w-[18px]" />}
          theme="amber"
          pied="Soumis par les établissements"
        />
      </div>

      <Panel className="overflow-hidden">
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un établissement…"
          enfants={<FiltreTypeStatistique valeur={filtre} onChange={setFiltre} />}
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <div key={cle} className="h-12 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-page-bg)]" />
            ))}
          </div>
        ) : etablissements.length === 0 ? (
          <EmptyState
            icone={Building2}
            titre="Aucun établissement"
            description="Aucun établissement ne correspond à votre recherche."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
                  <Th>Établissement</Th>
                  {afficheProjets ? <Th>Projets</Th> : null}
                  {affichePartenaires ? <Th>Partenaires</Th> : null}
                  {filtre === "tous" ? <Th>Partenariats</Th> : null}
                  <Th>Statut</Th>
                  <th className="w-14 px-5 py-3" aria-hidden="true" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {etablissements.map((etablissement) => (
                  <LigneEtablissement
                    key={etablissement.id}
                    etablissement={etablissement}
                    statistiques={statistiques.get(etablissement.id)}
                    maxProjets={totaux.maxProjets}
                    maxPartenaires={totaux.maxPartenaires}
                    afficheProjets={afficheProjets}
                    affichePartenaires={affichePartenaires}
                    afficheTotalPartenariats={filtre === "tous"}
                    lien={`${cheminBase}/etablissements/${etablissement.id}`}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data ? <TablePagination meta={data.meta} onChangerPage={setPage} /> : null}
      </Panel>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-3 font-semibold">
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />
      </span>
    </th>
  );
}

function LigneEtablissement({
  etablissement,
  statistiques,
  maxProjets,
  maxPartenaires,
  afficheProjets,
  affichePartenaires,
  afficheTotalPartenariats,
  lien,
}: {
  etablissement: Etablissement;
  statistiques?: ComparatifEtablissement;
  maxProjets: number;
  maxPartenaires: number;
  afficheProjets: boolean;
  affichePartenaires: boolean;
  afficheTotalPartenariats: boolean;
  lien: string;
}) {
  const projets = statistiques?.projets ?? 0;
  const partenaires = statistiques?.partenaires ?? 0;
  const partenariats = statistiques?.partenariats ?? 0;
  const actif = (statistiques?.projets_actifs ?? 0) > 0;

  return (
    <tr className="transition-colors hover:bg-[var(--color-page-bg)]">
      <td className="px-5 py-3.5">
        <Link to={lien} className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--color-active-zone)] text-xs font-bold text-[var(--color-brand)]">
            {etablissement.logo_url ? (
              <LogoMedia src={etablissement.logo_url} nom={etablissement.nom} className="h-full w-full object-contain p-0.5 text-[10px]" loading="lazy" />
            ) : (
              initiales(etablissement.nom)
            )}
          </span>
          <span className="min-w-0">
            <span className="block break-words font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand)]">
              {etablissement.nom}
            </span>
            <span className="block font-mono text-[12px] text-[var(--color-text-secondary)]">{etablissement.sigle ?? "—"}</span>
          </span>
        </Link>
      </td>
      {afficheProjets ? <Valeur valeur={projets} max={maxProjets} couleur="bg-[var(--chart-brand)]" /> : null}
      {affichePartenaires ? <Valeur valeur={partenaires} max={maxPartenaires} couleur="bg-[var(--chart-circuit)]" /> : null}
      {afficheTotalPartenariats ? (
        <td className="px-5 py-3.5 font-mono text-[var(--color-text-secondary)]">{partenariats}</td>
      ) : null}
      <td className="px-5 py-3.5">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold",
            actif
              ? "bg-[var(--color-brand)] text-white"
              : "border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[var(--color-text-secondary)]",
          )}
        >
          {actif ? "Actif" : "Inactif"}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <Link
          to={lien}
          aria-label={`Ouvrir ${etablissement.nom}`}
          className="inline-grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function Valeur({ valeur, max, couleur }: { valeur: number; max: number; couleur: string }) {
  const pourcentage = max > 0 ? Math.round((valeur / max) * 100) : 0;
  return (
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <span className="w-8 font-mono font-bold text-[var(--color-text-primary)]">{valeur}</span>
        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-page-bg)]">
          <span className={cn("block h-full rounded-full", couleur)} style={{ width: `${pourcentage}%` }} />
        </span>
      </div>
    </td>
  );
}
