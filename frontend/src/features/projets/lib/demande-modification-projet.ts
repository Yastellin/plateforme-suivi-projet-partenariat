import type { Projet, RoleUtilisateur } from '@/types/api';

export const REFERENCE_DEMANDE_MODIFICATION_PROJET =
  'DEMANDE_MODIFICATION_PROJET';

export function peutDemanderModificationProjet(
  projet: Pick<Projet, 'archive' | 'cree_par_role' | 'publie_le' | 'statut'>,
  role: RoleUtilisateur | null | undefined,
): boolean {
  if (
    role !== 'ETABLISSEMENT' ||
    projet.archive ||
    projet.cree_par_role !== 'ETABLISSEMENT'
  ) {
    return false;
  }

  // Le backend représente la publication avec publie_le, et non avec un
  // statut PUBLIE dans StatutProjet.
  return (
    projet.statut === 'EN_ATTENTE' ||
    projet.statut === 'EN_COURS' ||
    Boolean(projet.publie_le)
  );
}
