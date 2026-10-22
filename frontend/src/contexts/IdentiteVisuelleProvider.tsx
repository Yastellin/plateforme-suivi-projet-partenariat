import { useEffect, useMemo, useRef, type ReactNode } from "react";

import { useConfigurationPublique } from "@/features/espace-public/api/useConfigurationPublique";
import { resoudreUrlFichier } from "@/lib/url";
import { IdentiteVisuelleContext } from "@/contexts/identite-visuelle-context";

/**
 * Source de vérité unique de l'identité visuelle de la Présidence.
 * La configuration publique est accessible avant comme après authentification.
 */
export function IdentiteVisuelleProvider({ children }: { children: ReactNode }) {
  const { data: configuration } = useConfigurationPublique();
  const logoUrl = configuration?.logo_url ?? null;
  const hrefFaviconInitial = useRef<string | null | undefined>(undefined);
  const typeFaviconInitial = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const lien = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!lien) return;

    if (hrefFaviconInitial.current === undefined) {
      hrefFaviconInitial.current = lien.getAttribute("href");
      typeFaviconInitial.current = lien.getAttribute("type");
    }

    const restaurerFavicon = () => {
      if (hrefFaviconInitial.current) {
        lien.setAttribute("href", hrefFaviconInitial.current);
      } else {
        lien.removeAttribute("href");
      }
      if (typeFaviconInitial.current) {
        lien.setAttribute("type", typeFaviconInitial.current);
      } else {
        lien.removeAttribute("type");
      }
    };

    const href = logoUrl
      ? resoudreUrlFichier(logoUrl)
      : hrefFaviconInitial.current;
    if (href) {
      lien.setAttribute("href", href);
    } else {
      lien.removeAttribute("href");
    }
    if (logoUrl) {
      // Le logo téléversé peut être PNG, JPEG ou WebP : laisser le navigateur
      // déduire son type au lieu de conserver le type SVG du favicon de repli.
      lien.removeAttribute("type");
      lien.addEventListener("error", restaurerFavicon, { once: true });
    }

    return () => {
      lien.removeEventListener("error", restaurerFavicon);
      restaurerFavicon();
    };
  }, [logoUrl]);

  const valeur = useMemo(() => ({ logoUrl }), [logoUrl]);

  return (
    <IdentiteVisuelleContext.Provider value={valeur}>
      {children}
    </IdentiteVisuelleContext.Provider>
  );
}
