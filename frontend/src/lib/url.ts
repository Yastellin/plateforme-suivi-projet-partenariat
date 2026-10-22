// src/lib/url.ts
//
// Les médias publics envoyés (logos et photos) sont exposés par le backend
// sous le préfixe "/uploads/" et, pour les déploiements qui ne proxifient que
// l'API, sous "/api/uploads/". Les documents restent téléchargés via une route
// authentifiée.

const API_BASE_URL = (import.meta.env.VITE_API_URL?.trim() || "/api").replace(
  /\/+$/,
  "",
);

const API_EST_ABSOLUE = /^https?:\/\//i.test(API_BASE_URL);
const BACKEND_ORIGIN = API_EST_ABSOLUE ? new URL(API_BASE_URL).origin : "";

function estUrlAutonome(url: string): boolean {
  return /^(?:https?:)?\/\//i.test(url) || /^(?:blob|data):/i.test(url);
}

/**
 * Retourne les URLs publiques à essayer pour un média stocké. Le chemin sous
 * `/api/uploads` est prioritaire, car il fonctionne derrière un proxy qui
 * n'expose que l'API. Le chemin historique `/uploads` reste un repli utile
 * pendant un déploiement progressif ou lorsque le backend a sa propre origine.
 */
export function resoudreUrlsFichier(
  url: string | null | undefined,
): string[] {
  if (!url) return [];
  const valeur = url.trim();
  if (!valeur) return [];
  if (estUrlAutonome(valeur)) return [valeur];

  let cheminUploads: string | null = null;
  if (valeur.startsWith("/api/uploads/")) {
    cheminUploads = valeur.slice(4);
  } else if (valeur.startsWith("/uploads/")) {
    cheminUploads = valeur;
  } else if (valeur.startsWith("uploads/")) {
    cheminUploads = `/${valeur}`;
  }

  if (cheminUploads) {
    return Array.from(
      new Set([
        `${API_BASE_URL}${cheminUploads}`,
        `${BACKEND_ORIGIN}${cheminUploads}`,
      ]),
    );
  }

  return [
    valeur.startsWith("/")
      ? `${BACKEND_ORIGIN}${valeur}`
      : `${BACKEND_ORIGIN}/${valeur}`,
  ];
}

/** Retourne l'URL prioritaire d'un média public. */
export function resoudreUrlFichier(url: string | null | undefined): string {
  return resoudreUrlsFichier(url)[0] ?? "";
}

export { API_BASE_URL, BACKEND_ORIGIN };
