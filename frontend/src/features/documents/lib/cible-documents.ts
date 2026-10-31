export type EntiteDocuments = 'projet' | 'convention' | 'partenariat';

interface DefinitionEntiteDocuments {
  parametre: string;
  ancienParametre?: string;
  libelle: string;
  formulation: string;
  cheminDetail: string;
}

const DEFINITIONS: Record<EntiteDocuments, DefinitionEntiteDocuments> = {
  projet: {
    parametre: 'projet_id',
    ancienParametre: 'projet',
    libelle: 'projet',
    formulation: 'au projet',
    cheminDetail: 'projets',
  },
  convention: {
    parametre: 'convention_id',
    libelle: 'convention',
    formulation: 'à la convention',
    cheminDetail: 'conventions',
  },
  partenariat: {
    parametre: 'partenariat_id',
    libelle: 'partenariat',
    formulation: 'au partenariat',
    cheminDetail: 'partenaires-partenariats/partenariats',
  },
};

export interface CibleDocuments {
  entite: EntiteDocuments;
  id: string;
  parametre: string;
  libelle: string;
  formulation: string;
  cheminDetail: string;
}

export function lireCibleDocuments(
  parametres: URLSearchParams,
): CibleDocuments | null {
  for (const [entite, definition] of Object.entries(DEFINITIONS) as Array<
    [EntiteDocuments, DefinitionEntiteDocuments]
  >) {
    const id =
      parametres.get(definition.parametre) ??
      (definition.ancienParametre
        ? parametres.get(definition.ancienParametre)
        : null);
    if (id) {
      return {
        entite,
        id,
        parametre: definition.parametre,
        libelle: definition.libelle,
        formulation: definition.formulation,
        cheminDetail: definition.cheminDetail,
      };
    }
  }
  return null;
}

export function creerLienDocuments(
  cheminBase: string,
  entite: EntiteDocuments,
  id: string,
): string {
  const definition = DEFINITIONS[entite];
  const parametres = new URLSearchParams({ [definition.parametre]: id });
  return `${cheminBase}/documents?${parametres.toString()}`;
}

export function creerLienFicheDocument(
  cheminBase: string,
  cible: CibleDocuments,
): string {
  return `${cheminBase}/${cible.cheminDetail}/${encodeURIComponent(cible.id)}`;
}
