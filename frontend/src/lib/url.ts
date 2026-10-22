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
 * Transforme une URL de stockage relative en URL publique servie par la même
 * base que l'API. Cela évite qu'un navigateur demande `/uploads` au conteneur
 * frontend alors que seul `/api` est redirigé vers le backend.
 */
export function resoudreUrlFichier(url: string | null | undefined): string {
  if (!url) return "";
  const valeur = url.trim();
  if (!valeur) return "";
  if (estUrlAutonome(valeur)) return valeur;

  // Une ancienne réponse peut déjà contenir le préfixe public de l'API.
  if (valeur.startsWith("/api/uploads/")) {
    return API_EST_ABSOLUE ? `${BACKEND_ORIGIN}${valeur}` : valeur;
  }

  const cheminUploads = valeur.startsWith("/uploads/")
    ? valeur
    : valeur.startsWith("uploads/")
      ? `/${valeur}`
      : null;

  if (cheminUploads) {
    return `${API_BASE_URL}${cheminUploads}`;
  }

  if (valeur.startsWith("/")) return `${BACKEND_ORIGIN}${valeur}`;
  return `${BACKEND_ORIGIN}/${valeur}`;
}

export { API_BASE_URL, BACKEND_ORIGIN };
