import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { resoudreUrlFichier } from "@/lib/url";

interface ImageMediaProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  src?: string | null;
  fallback?: ReactNode;
  /** Désactive la résolution via l'URL de l'API pour les aperçus blob/data locaux. */
  resoudre?: boolean;
}

/**
 * Image distante avec repli visuel. Une URL absente ou en erreur n'affiche
 * jamais l'icône d'image cassée ni le texte alternatif brut du navigateur.
 */
export function ImageMedia({
  src,
  alt = "",
  className,
  fallback,
  resoudre = true,
  onError,
  ...props
}: ImageMediaProps) {
  const source = resoudre ? resoudreUrlFichier(src) : (src ?? "");
  const [sourceEnErreur, setSourceEnErreur] = useState<string | null>(null);
  const indisponible = !source || sourceEnErreur === source;

  if (indisponible) {
    if (fallback !== undefined) return <>{fallback}</>;

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center bg-[var(--color-page-bg)] text-[var(--color-text-secondary)]",
          className,
        )}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <ImageOff className="h-1/3 min-h-4 w-1/3 min-w-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      {...props}
      src={source}
      alt={alt}
      className={className}
      onError={(evenement) => {
        setSourceEnErreur(source);
        onError?.(evenement);
      }}
    />
  );
}

interface LogoMediaProps extends Omit<
  ImageMediaProps,
  "alt" | "fallback" | "resoudre"
> {
  nom: string;
}

function initiales(nom: string): string {
  const mots = nom
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((mot) => mot.replace(/^(?:d|l)['’]/i, ""))
    .filter(Boolean);
  const motsSignificatifs = mots.filter(
    (mot) =>
      !["de", "des", "du", "la", "le", "les", "et"].includes(
        mot.toLocaleLowerCase("fr"),
      ),
  );
  const candidats = motsSignificatifs.length > 0 ? motsSignificatifs : mots;
  if (candidats.length === 0) return "—";
  if (candidats.length === 1) {
    return candidats[0].slice(0, 2).toLocaleUpperCase("fr");
  }
  return `${candidats[0][0]}${candidats[1][0]}`.toLocaleUpperCase("fr");
}

/** Logo avec initiales lorsque le fichier n'existe plus ou n'est pas accessible. */
export function LogoMedia({ src, nom, className, ...props }: LogoMediaProps) {
  return (
    <ImageMedia
      {...props}
      src={src}
      alt={`Logo de ${nom}`}
      className={className}
      fallback={
        <span
          className={cn(
            "inline-flex items-center justify-center bg-[var(--color-page-bg)] font-heading font-bold text-[var(--color-brand)]",
            className,
          )}
          role="img"
          aria-label={`Logo de ${nom} indisponible`}
          title={`Logo de ${nom} indisponible`}
        >
          {initiales(nom)}
        </span>
      }
    />
  );
}
