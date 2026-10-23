import type { RoleUtilisateur } from "@/types/api"

interface DonneeAvecProvenance {
  cree_par_role?: string | null
  soumis_le?: string | null
}

/**
 * Défense d'interface complémentaire au cloisonnement serveur : une liste
 * générale Présidence ne rend jamais une donnée créée ou soumise par un
 * établissement. Ces données restent accessibles dans la fiche de ce dernier.
 */
export function filtrerListeGenerale<T extends DonneeAvecProvenance>(
  donnees: T[],
  role?: RoleUtilisateur,
): T[] {
  if (role !== "PRESIDENCE") return donnees

  return donnees.filter(
    (donnee) =>
      donnee.cree_par_role === "PRESIDENCE" && !donnee.soumis_le,
  )
}
