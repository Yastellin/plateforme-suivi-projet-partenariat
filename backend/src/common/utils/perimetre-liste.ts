import { Role } from '../enums/role.enum';

export interface PerimetreListeDonnees {
  etablissementId?: string;
  origine?: Role.PRESIDENCE | Role.ETABLISSEMENT;
  soumisesUniquement?: boolean;
}

/**
 * Sépare les données propres à la Présidence de celles produites par les
 * établissements. Un établissement conserve son périmètre historique, tandis
 * que sa section côté Présidence n'expose que ses données déjà soumises.
 */
export function determinerPerimetreListe(
  utilisateur: unknown,
  etablissementDemande?: string,
): PerimetreListeDonnees {
  if (!utilisateur || typeof utilisateur !== 'object') {
    return {};
  }

  const donnees = utilisateur as {
    role?: unknown;
    etablissement_id?: unknown;
  };

  if (donnees.role === Role.ETABLISSEMENT) {
    return {
      etablissementId:
        typeof donnees.etablissement_id === 'string'
          ? donnees.etablissement_id
          : undefined,
    };
  }

  if (donnees.role === Role.PRESIDENCE) {
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
