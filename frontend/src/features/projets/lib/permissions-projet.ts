import type { Projet, RoleUtilisateur } from '@/types/api';

type ProjetModifiable = Pick<
  Projet,
  'archive' | 'cree_par_role' | 'publie_le' | 'soumis_le' | 'statut'
>;

/**
 * La Présidence ne modifie que ses propres projets. Un établissement conserve
 * la main sur ses brouillons jusqu'à leur soumission.
 */
export function peutModifierProjet(
  projet: ProjetModifiable,
  role: RoleUtilisateur | null | undefined,
): boolean {
  if (projet.archive) return false;

  if (role === 'PRESIDENCE') {
    return projet.cree_par_role === 'PRESIDENCE';
  }

  if (role === 'ETABLISSEMENT') {
    return (
      projet.cree_par_role === 'ETABLISSEMENT' &&
      projet.statut === 'BROUILLON' &&
      !projet.soumis_le &&
      !projet.publie_le
    );
  }

  return false;
}
