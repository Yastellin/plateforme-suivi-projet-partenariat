import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { resoudreUrlsFichier } from "@/lib/url";

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
 * Image distante qui ne rend un repli que si celui-ci est explicitement fourni.
 * Sans repli, une URL absente ou en erreur ne réserve aucun bloc de remplacement.
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
  const sources = resoudre
    ? resoudreUrlsFichier(src)
    : src
      ? [src]
      : [];
  const [derniereSourceEnErreur, setDerniereSourceEnErreur] = useState<
    string | null
  >(null);
  const indexDerniereErreur = derniereSourceEnErreur
    ? sources.indexOf(derniereSourceEnErreur)
    : -1;
  const source = sources[indexDerniereErreur + 1] ?? "";
  const indisponible = !source;

  if (indisponible) {
    return fallback === undefined ? null : <>{fallback}</>;
  }

  return (
    <img
      {...props}
      src={source}
      alt={alt}
      className={className}
      onError={(evenement) => {
        setDerniereSourceEnErreur(source);
        onError?.(evenement);
      }}
    />
  );
}

interface LogoMediaProps extends Omit<ImageMediaProps, "alt" | "resoudre"> {
  nom: string;
}

/** Logo facultatif : aucune tuile de remplacement n'est rendue si le fichier manque. */
export function LogoMedia({ src, nom, ...props }: LogoMediaProps) {
  return <ImageMedia {...props} src={src} alt={`Logo de ${nom}`} />;
}
