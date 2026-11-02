// src/components/shared/LogoEtablissement.tsx

import { LogoMedia } from "@/components/shared/ImageMedia";
import { cn } from "@/lib/utils";

interface LogoEtablissementProps {
  logoUrl?: string | null;
  nom: string;
  className?: string;
}

function initialesDe(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("");
}

/** Logo choisi par l'établissement, ou ses initiales à défaut. */
export function LogoEtablissement({ logoUrl, nom, className }: LogoEtablissementProps) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 flex-shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[10px] font-bold text-[var(--color-text-secondary)]",
        className,
      )}
    >
      {logoUrl ? (
        <LogoMedia
          src={logoUrl}
          nom={nom}
          className="h-full w-full object-contain p-0.5"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{initialesDe(nom) || "—"}</span>
      )}
    </span>
  );
}
