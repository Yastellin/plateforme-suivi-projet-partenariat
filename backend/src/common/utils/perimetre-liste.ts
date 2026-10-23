import { Role } from '../enums/role.enum';

export type EtatSoumissionListe = 'SOUMISES' | 'NON_SOUMISES';

export interface PerimetreListeDonnees {
  etablissementId?: string;
  origine?: Role.PRESIDENCE | Role.ETABLISSEMENT;
  etatSoumission?: EtatSoumissionListe;
}

/**
 * Sépare les données propres à la Présidence de celles produites par les
 * établissements. Un établissement conserve son périmètre historique, tandis
 * que sa section côté Présidence n'expose que ses données déjà soumises.
 *
 * L'état de soumission complète la provenance afin de prendre en charge les
 * données historiques dont l'origine avait été attribuée à la Présidence lors
 * de l'introduction du suivi de provenance.
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
        etatSoumission: 'SOUMISES',
      };
    }

    return {
      origine: Role.PRESIDENCE,
      etatSoumission: 'NON_SOUMISES',
    };
  }

  return {};
}
