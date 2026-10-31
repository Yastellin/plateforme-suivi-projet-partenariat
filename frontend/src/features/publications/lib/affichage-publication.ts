// src/features/publications/lib/affichage-publication.ts

/**
 * Formate la date de publication en « 15 mars 2026 ».
 * Renvoie null si la valeur est vide ou invalide : ne jamais appeler new Date() sur du vide.
 */
export function formaterDatePublication(valeur: string | null | undefined): string | null {
  if (!valeur) return null
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

/** Choisit le singulier ou le pluriel selon le nombre (0 et 1 au singulier, comme en français). */
export function pluriel(nombre: number, singulier: string, pluriel: string): string {
  return nombre > 1 ? pluriel : singulier
}

export function libelleStatutPublication(statut: "PUBLIEE" | "BROUILLON"): string {
  return statut === "PUBLIEE" ? "Publiée" : "Brouillon"
}
