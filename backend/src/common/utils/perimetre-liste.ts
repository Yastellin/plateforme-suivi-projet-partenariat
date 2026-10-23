import { Role } from '../enums/role.enum';

export interface PerimetreListeDonnees {
  etablissementId?: string;
  origine?: Role.PRESIDENCE | Role.ETABLISSEMENT;
  soumisesUniquement?: boolean;
}

interface UtilisateurAvecPerimetre {
  role: Role;
  etablissement_id?: string | null;
}

/**
 * Sépare les données propres à la Présidence de celles produites par les
 * établissements. Un établissement conserve son périmètre historique, tandis
 * que sa section côté Présidence n'expose que ses données déjà soumises.
 */
export function determinerPerimetreListe(
  utilisateur: UtilisateurAvecPerimetre,
  etablissementDemande?: string,
): PerimetreListeDonnees {
  if (utilisateur.role === Role.ETABLISSEMENT) {
    return {
      etablissementId: utilisateur.etablissement_id ?? undefined,
    };
  }

  if (utilisateur.role === Role.PRESIDENCE) {
    if (etablissementDemande) {
      return {
        etablissementId: etablissementDemande,
        origine: Role.ETABLISSEMENT,
        soumisesUniquement: true,
      };
    }

    return { origine: Role.PRESIDENCE };
  }

  return {};
}
