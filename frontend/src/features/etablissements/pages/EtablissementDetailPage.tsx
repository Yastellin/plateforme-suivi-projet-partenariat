// src/features/etablissements/pages/EtablissementDetailPage.tsx

import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  Briefcase,
  Building2,
  Inbox,
  LayoutGrid,
  Link2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEtablissement } from "@/features/etablissements/api/useEtablissement";
import { useComparatifEtablissements } from "@/features/tableau-de-bord/api/useComparatifEtablissements";
import { useProjets } from "@/features/projets/api/useProjets";
import { usePartenaires } from "@/features/partenaires/api/usePartenaires";
import { usePartenariats } from "@/features/partenariats/api/usePartenariats";
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext";
import { usePermissions } from "@/hooks/usePermissions";
import { obtenirInfoStatut, LIBELLES_DOMAINE_PARTENARIAT } from "@/lib/status-mappings";
import { formaterDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Onglet = "all" | "projets" | "partenariats" | "partenaires";

// Couleurs de pastille (classes complètes pour que Tailwind les détecte)
const TEINTES = {
  sky: {
    carte: "border-sky-200/70 bg-linear-to-br from-sky-50 to-white dark:border-sky-400/20 dark:from-sky-400/10 dark:to-transparent",
    pastille: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  emerald: {
    carte: "border-emerald-200/70 bg-linear-to-br from-emerald-50 to-white dark:border-emerald-400/20 dark:from-emerald-400/10 dark:to-transparent",
    pastille: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  violet: {
    carte: "border-violet-200/70 bg-linear-to-br from-violet-50 to-white dark:border-violet-400/20 dark:from-violet-400/10 dark:to-transparent",
    pastille: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  },
  amber: {
    carte: "border-amber-200/70 bg-linear-to-br from-amber-50 to-white dark:border-amber-400/20 dark:from-amber-400/10 dark:to-transparent",
    pastille: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
} as const;

type Teinte = keyof typeof TEINTES;

export function EtablissementDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const permissions = usePermissions();
  const [onglet, setOnglet] = useState<Onglet>("all");
  const { data: etablissement, isLoading } = useEtablissement(id);
  const { data: comparatif } = useComparatifEtablissements();
  const projets = useProjets({ page: 1, limit: 10, etablissement_id: id });
  const partenaires = usePartenaires({ page: 1, limit: 10, etablissement_id: id });
  const partenariats = usePartenariats({ page: 1, limit: 10, etablissement_id: id });
  useTitreBreadcrumb(etablissement?.sigle || etablissement?.nom);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }
  if (!etablissement) {
    return (
      <EmptyState
        icone={Building2}
        titre="Établissement introuvable"
        description="Cet établissement n'existe pas ou a été supprimé."
      />
    );
  }

  const statistiques = comparatif?.find((item) => item.etablissement_id === id);
  const cheminBase = permissions.estDecideur ? "/decideur" : "/presidence";

  const nbProjets = projets.data?.meta.total ?? 0;
  const nbPartenariats = partenariats.data?.meta.total ?? 0;
  const nbPartenaires = partenaires.data?.meta.total ?? 0;

  const kpis: { libelle: string; valeur: number; icone: LucideIcon; teinte: Teinte }[] = [
    { libelle: "Projets", valeur: statistiques?.projets ?? nbProjets, icone: Briefcase, teinte: "sky" },
    { libelle: "Projets actifs", valeur: statistiques?.projets_actifs ?? 0, icone: Activity, teinte: "emerald" },
    { libelle: "Partenaires", valeur: statistiques?.partenaires ?? nbPartenaires, icone: Users, teinte: "violet" },
    { libelle: "Partenariats", valeur: statistiques?.partenariats ?? nbPartenariats, icone: Link2, teinte: "amber" },
  ];

  const onglets: { cle: Onglet; libelle: string; icone: LucideIcon; compteur?: number }[] = [
    { cle: "all", libelle: "Vue d'ensemble", icone: LayoutGrid },
    { cle: "projets", libelle: "Projets", icone: Briefcase, compteur: nbProjets },
    { cle: "partenariats", libelle: "Partenariats", icone: Link2, compteur: nbPartenariats },
    { cle: "partenaires", libelle: "Partenaires", icone: Users, compteur: nbPartenaires },
  ];

  const afficher = (section: Exclude<Onglet, "all">) => onglet === "all" || onglet === section;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Bannière d'en-tête */}
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-500 px-6 pb-16 pt-9 text-white sm:px-10 dark:from-emerald-900 dark:via-emerald-800 dark:to-teal-800">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 right-28 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl font-bold tracking-tight ring-1 ring-white/30 backdrop-blur sm:h-24 sm:w-24 sm:text-4xl">
            {etablissement.logo_url ? (
              <img
                src={etablissement.logo_url}
                alt=""
                className="h-full w-full rounded-2xl object-contain p-2"
              />
            ) : (
              initiales(etablissement.sigle || etablissement.nom)
            )}
          </div>
          <div className="min-w-[16rem] flex-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-emerald-100/90">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Établissement
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              {etablissement.nom}
            </h1>
            {etablissement.sigle ? (
              <div className="mt-4">
                <span className="inline-block rounded-full bg-white px-3.5 py-1 text-xs font-bold tracking-wide text-emerald-800">
                  {etablissement.sigle}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Indicateurs */}
      <section
        aria-label="Statistiques"
        className="relative -mt-9 mx-3 grid grid-cols-2 gap-4 sm:mx-6 lg:grid-cols-4"
      >
        {kpis.map((kpi) => {
          const Icone = kpi.icone;
          return (
            <div
              key={kpi.libelle}
              className={cn("rounded-2xl border p-4 shadow-sm bg-white dark:bg-[#0e1714]", TEINTES[kpi.teinte].carte)}
            >
              <span
                className={cn("grid h-9 w-9 place-items-center rounded-lg", TEINTES[kpi.teinte].pastille)}
                aria-hidden="true"
              >
                <Icone className="h-[18px] w-[18px]" />
              </span>
              <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{kpi.valeur}</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{kpi.libelle}</div>
            </div>
          );
        })}
      </section>

      {/* Filtre par section */}
      <div
        role="tablist"
        aria-label="Filtrer l'affichage"
        className="mt-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-black/5 bg-white p-1.5 dark:border-white/10 dark:bg-white/[.04]"
      >
        {onglets.map((item) => {
          const actif = onglet === item.cle;
          const Icone = item.icone;
          return (
            <button
              key={item.cle}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => setOnglet(item.cle)}
              className={cn(
                "flex h-11 min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-medium transition",
                actif
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10",
              )}
            >
              <Icone className="h-4 w-4" aria-hidden="true" />
              {item.libelle}
              {item.compteur !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    actif
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-white/10",
                  )}
                >
                  {item.compteur}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Sections en tableaux */}
      <div className="mt-4 flex flex-col gap-4">
        {afficher("projets") ? (
          <Section
            titre="Projets"
            description="Projets de cet établissement"
            icone={Briefcase}
            teinte="sky"
            total={projets.data?.meta.total ?? 0}
            colonnes={["Intitulé", "Statut", "Début", "Fin"]}
            messageVide="Aucun projet pour le moment."
            lignes={(projets.data?.data ?? []).map((projet) => {
              const statut = obtenirInfoStatut(projet.statut);
              return (
                <tr key={projet.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3">
                    <Link
                      to={`${cheminBase}/projets/${projet.id}`}
                      className="font-semibold text-[var(--color-brand)] hover:underline"
                    >
                      {projet.nom}
                    </Link>
                    {projet.intitule_officiel ? (
                      <p className="text-xs text-slate-500">{projet.intitule_officiel}</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <StatusBadge libelle={statut.libelle} tonalite={statut.tonalite} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 tabular-nums">{formaterDate(projet.date_debut)}</td>
                  <td className="whitespace-nowrap px-5 py-3 tabular-nums">
                    {projet.date_fin_prevue ? formaterDate(projet.date_fin_prevue) : "—"}
                  </td>
                </tr>
              );
            })}
          />
        ) : null}

        {afficher("partenariats") ? (
          <Section
            titre="Partenariats"
            description="Partenariats impliquant cet établissement"
            icone={Link2}
            teinte="amber"
            total={partenariats.data?.meta.total ?? 0}
            colonnes={["Partenaire", "Type", "Statut", "Période"]}
            messageVide="Aucun partenariat pour le moment."
            lignes={(partenariats.data?.data ?? []).map((partenariat) => {
              const statut = obtenirInfoStatut(partenariat.statut);
              const nomsPartenaires = partenariat.partenaires.map((partenaire) => partenaire.nom).join(", ");
              return (
                <tr key={partenariat.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3">
                    <Link
                      to={`${cheminBase}/partenaires-partenariats/partenariats/${partenariat.id}`}
                      className="font-semibold text-[var(--color-brand)] hover:underline"
                    >
                      {nomsPartenaires || partenariat.intitule}
                    </Link>
                    <p className="text-xs text-slate-500">{partenariat.intitule}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine] ?? partenariat.domaine}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <StatusBadge libelle={statut.libelle} tonalite={statut.tonalite} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 tabular-nums">
                    {formaterDate(partenariat.date_debut)}
                    {" → "}
                    {partenariat.date_fin ? formaterDate(partenariat.date_fin) : "—"}
                  </td>
                </tr>
              );
            })}
          />
        ) : null}

        {afficher("partenaires") ? (
          <Section
            titre="Partenaires"
            description="Organisations partenaires de cet établissement"
            icone={Users}
            teinte="violet"
            total={partenaires.data?.meta.total ?? 0}
            colonnes={["Nom", "Type", "Pays"]}
            messageVide="Aucun partenaire pour le moment."
            lignes={(partenaires.data?.data ?? []).map((partenaire) => (
              <tr key={partenaire.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3">
                  <Link
                    to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                    className="font-semibold text-[var(--color-brand)] hover:underline"
                  >
                    {partenaire.nom}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-3">{partenaire.type}</td>
                <td className="whitespace-nowrap px-5 py-3">{partenaire.pays}</td>
              </tr>
            ))}
          />
        ) : null}
      </div>
    </div>
  );
}

interface SectionProps {
  titre: string;
  description: string;
  icone: LucideIcon;
  teinte: Teinte;
  total: number;
  colonnes: string[];
  messageVide: string;
  lignes: ReactNode[];
}

// Carte à en-tête + tableau. Si aucune ligne : une seule ligne d'état vide, sans action.
function Section({ titre, description, icone: Icone, teinte, total, colonnes, messageVide, lignes }: SectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-white/[.04]">
      <div className="flex items-center gap-3 px-5 py-4">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", TEINTES[teinte].pastille)} aria-hidden="true">
          <Icone className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            {titre}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-white/10">
              {total}
            </span>
          </h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-white/5">
            <tr>
              {colonnes.map((colonne) => (
                <th key={colonne} scope="col" className="whitespace-nowrap px-5 py-2.5 text-left font-semibold">
                  {colonne}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.length > 0 ? (
              lignes
            ) : (
              <tr>
                <td colSpan={colonnes.length} className="px-5 py-10 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/10">
                    <Inbox className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{messageVide}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Les éléments rattachés à cet établissement apparaîtront ici.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-black/5 px-5 py-2.5 text-xs text-slate-500 dark:border-white/10">
        {total} résultat{total > 1 ? "s" : ""}
      </div>
    </section>
  );
}

function initiales(texte: string): string {
  const mots = texte.trim().split(/\s+/).filter(Boolean);
  if (mots.length >= 2) return `${mots[0][0]}${mots[1][0]}`.toUpperCase();
  return texte.slice(0, 2).toUpperCase();
}
