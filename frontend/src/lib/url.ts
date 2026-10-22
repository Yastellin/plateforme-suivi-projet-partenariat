// src/lib/url.ts
//
// Les médias publics envoyés (logos et photos) sont exposés par le backend
// sous le préfixe "/uploads/". Les documents restent téléchargés via une route
// authentifiée. Le client peut tourner sur une origine
// differente (Vite :5173) de l'API (:3000), donc une URL relative type
// "/uploads/publications/xxx.png" resoudrait contre le mauvais host.
// Cette helper reconstitue une URL absolue pointant vers le backend.

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api"

// Une API absolue (développement avec deux serveurs) impose son origine. Avec
// une base relative (déploiement derrière un proxy), garder une URL relative
// permet au navigateur d'utiliser automatiquement l'origine publique courante.
const BACKEND_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? new URL(API_BASE_URL).origin
  : ""

/**
 * Transforme une URL de stockage relative (ex. "/uploads/publications/1/abc.png")
 * en URL absolue vers le backend. Les URLs deja absolues sont retourne telles quelles.
 */
export function resoudreUrlFichier(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return `${BACKEND_ORIGIN}${url}`
  return `${BACKEND_ORIGIN}/${url}`
}

export { BACKEND_ORIGIN }
