// src/features/etablissements/components/CarteStatistiquesEtablissement.tsx

import { Link } from "react-router-dom";
import { Building2, FolderKanban, Handshake } from "lucide-react";
import { LogoMedia } from "@/components/shared/ImageMedia";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { ComparatifEtablissement, Etablissement } from "@/types/api";
import type { TypeStatistique } from "@/features/etablissements/components/FiltreTypeStatistique";

interface CarteStatistiquesEtablissementProps {
  etablissement: Etablissement;
  statistiques?: ComparatifEtablissement;
  maxProjets: number;
  maxPartenaires: number;
  filtre: TypeStatistique;
  lien: string;
}

// Carte « Pulsation » : deux jauges (projets, partenaires) et un pied de statistiques.
export function CarteStatistiquesEtablissement({
  etablissement,
  statistiques,
  maxProjets,
  maxPartenaires,
  filtre,
  lien,
}: CarteStatistiquesEtablissementProps) {
  const projets = statistiques?.projets ?? 0;
  const partenaires = statistiques?.partenaires ?? 0;
  const projetsActifs = statistiques?.projets_actifs ?? 0;
  const partenariats = statistiques?.partenariats ?? 0;
  const cotutelles = statistiques?.cotutelles ?? 0;

  return (
    <Link
      to={lien}
      className="group flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px] shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
          {etablissement.logo_url ? (
            <LogoMedia
              src={etablissement.logo_url}
              nom={etablissement.nom}
              className="h-full w-full object-contain p-0.5 text-[10px]"
              loading="lazy"
            />
          ) : (
            <Building2 className="h-5 w-5 text-[var(--color-brand)]" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[var(--color-text-primary)]">{etablissement.nom}</p>
          <p className="font-mono text-[11.5px] text-[var(--color-text-secondary)]">{etablissement.sigle ?? "—"}</p>
        </div>
        {projetsActifs > 0 ? (
          <StatusBadge libelle="Projets actifs" tonalite="actif" />
        ) : (
          <StatusBadge libelle="Aucun projet actif" tonalite="brouillon" />
        )}
      </div>

      {filtre !== "partenaires" ? (
        <Jauge
          icone={FolderKanban}
          libelle="Projets"
          valeur={projets}
          max={maxProjets}
          couleur="bg-[var(--chart-brand)]"
        />
      ) : null}
      {filtre !== "projets" ? (
        <Jauge
          icone={Handshake}
          libelle="Partenaires"
          valeur={partenaires}
          max={maxPartenaires}
          couleur="bg-[var(--chart-circuit)]"
        />
      ) : null}

      <dl className="grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-3 text-center">
        <Pied libelle="Projets actifs" valeur={projetsActifs} />
        <Pied libelle="Partenariats" valeur={partenariats} />
        <Pied libelle="Cotutelles" valeur={cotutelles} />
      </dl>
    </Link>
  );
}

function Jauge({
  icone: Icone,
  libelle,
  valeur,
  max,
  couleur,
}: {
  icone: typeof Building2;
  libelle: string;
  valeur: number;
  max: number;
  couleur: string;
}) {
  const pourcentage = max > 0 ? Math.round((valeur / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <Icone className="h-3.5 w-3.5" />
          {libelle}
        </span>
        <span className="font-mono font-bold text-[var(--color-text-primary)]">{valeur}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-page-bg)]"
        role="progressbar"
        aria-label={`${libelle} : ${valeur}`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={valeur}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", couleur)}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
    </div>
  );
}

function Pied({ libelle, valeur }: { libelle: string; valeur: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="order-2 text-[11px] text-[var(--color-text-secondary)]">{libelle}</dt>
      <dd className="order-1 font-mono text-[15px] font-bold text-[var(--color-text-primary)]">{valeur}</dd>
    </div>
  );
}
