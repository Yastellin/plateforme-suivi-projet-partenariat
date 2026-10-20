// src/lib/url.ts
//
// Les fichiers envoyes (logos, photos, documents) sont exposes par le backend
// sous le prefixe "/uploads/" (static assets). Le client tourne sur une origine
// differente (Vite :5173) de l'API (:3000), donc une URL relative type
// "/uploads/publications/xxx.png" resoudrait contre le mauvais host.
// Cette helper reconstitue une URL absolue pointant vers le backend.

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Origine du backend (on retire le suffixe "/api" eventuel).
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Transforme une URL de stockage relative (ex. "/uploads/publications/1/abc.png")
 * en URL absolue vers le backend. Les URLs deja absolues sont retourne telles quelles.
 */
export function resoudreUrlFichier(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
  return `${BACKEND_ORIGIN}/${url}`;
}

export { BACKEND_ORIGIN };
