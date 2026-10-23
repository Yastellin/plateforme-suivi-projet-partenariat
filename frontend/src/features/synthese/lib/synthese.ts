// src/features/synthese/lib/synthese.ts
//
// Logique pure du module « Synthèse annuelle » : constantes du contrat API,
// normalisation des réponses et agrégations. Aucun accès réseau, aucun JSX,
// pour rester testable sans navigateur (voir tests/synthese.test.ts).

import type {
  SyntheseCompteurs,
  SyntheseEtablissement,
  SyntheseGlobale,
  SyntheseItem,
  SynthesePartenaireStrategique,
  TypeItemSynthese,
} from '@/types/api';

/** Longueur minimale acceptée par POST /synthese/items (MinLength(3)). */
export const LONGUEUR_MIN_VALEUR = 3;

/** Longueur maximale d'un libellé d'axe sur le comparatif. */
const LONGUEUR_LIBELLE_GRAPHIQUE = 18;

export interface DefinitionTypeItemSynthese {
  valeur: TypeItemSynthese;
  libelle: string;
  description: string;
}

/**
 * Les trois éléments narratifs du modèle : un seul item par établissement,
 * par année et par type (contrainte d'unicité côté base).
 */
export const TYPES_ITEM_SYNTHESE: DefinitionTypeItemSynthese[] = [
  {
    valeur: 'DOMAINE_PRINCIPAL',
    libelle: 'Domaine principal',
    description: 'Axe scientifique ou thématique dominant de l’établissement pour l’année.',
  },
  {
    valeur: 'DEFI_MAJEUR',
    libelle: 'Défi majeur',
    description: 'Principale difficulté rencontrée par l’établissement sur l’exercice.',
  },
  {
    valeur: 'PRIORITE_FUTURE',
    libelle: 'Priorité future',
    description: 'Objectif prioritaire retenu pour l’exercice à venir.',
  },
];

const TYPES_CONNUS = new Set<string>(TYPES_ITEM_SYNTHESE.map((type) => type.valeur));

/** Libellé lisible d'un type d'item ; les types inconnus sont affichés bruts. */
export function libelleTypeItem(type: string): string {
  return TYPES_ITEM_SYNTHESE.find((definition) => definition.valeur === type)?.libelle ?? type;
}

/** Description d'un type d'item (chaîne vide si le type est inconnu). */
export function descriptionTypeItem(type: string): string {
  return TYPES_ITEM_SYNTHESE.find((definition) => definition.valeur === type)?.description ?? '';
}

/**
 * Années proposées dans le sélecteur : l'année courante, les années passées
 * (pour consulter les synthèses archivées) et l'année suivante (prévisionnel).
 * Ordre décroissant.
 */
export function anneesSelectionnables(
  anneeCourante: number = new Date().getFullYear(),
  nbPasse = 5,
  nbFutur = 1,
): number[] {
  const annees: number[] = [];
  for (let decalage = nbFutur; decalage >= -nbPasse; decalage -= 1) {
    annees.push(anneeCourante + decalage);
  }
  return annees;
}

/** Tronque un libellé pour les axes de graphique. */
export function tronquerLibelle(libelle: string, longueur = LONGUEUR_LIBELLE_GRAPHIQUE): string {
  return libelle.length > longueur ? `${libelle.slice(0, longueur - 1)}…` : libelle;
}

export function compteursVides(): SyntheseCompteurs {
  return {
    partenaires: 0,
    conventions_actives: 0,
    conventions_expirees: 0,
    cotutelles: 0,
    projets_actifs: 0,
  };
}

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null;
}

function versNombre(valeur: unknown): number {
  const nombre = typeof valeur === 'string' ? Number(valeur) : valeur;
  return typeof nombre === 'number' && Number.isFinite(nombre) ? nombre : 0;
}

function versTexte(valeur: unknown, defaut = ''): string {
  return typeof valeur === 'string' ? valeur : defaut;
}

function versTableau(valeur: unknown): unknown[] {
  return Array.isArray(valeur) ? valeur : [];
}

/** Normalise les compteurs : valeurs manquantes remplacées par 0. */
export function normaliserCompteurs(brut: unknown): SyntheseCompteurs {
  const source = estObjet(brut) ? brut : {};
  return {
    partenaires: versNombre(source.partenaires),
    conventions_actives: versNombre(source.conventions_actives),
    conventions_expirees: versNombre(source.conventions_expirees),
    cotutelles: versNombre(source.cotutelles),
    projets_actifs: versNombre(source.projets_actifs),
  };
}

export function normaliserItem(brut: unknown): SyntheseItem | null {
  if (!estObjet(brut) || typeof brut.id !== 'string') {
    return null;
  }
  return {
    id: brut.id,
    etablissement_id: versTexte(brut.etablissement_id),
    annee: versNombre(brut.annee),
    type: versTexte(brut.type),
    valeur: versTexte(brut.valeur),
    created_at: typeof brut.created_at === 'string' ? brut.created_at : undefined,
    updated_at: typeof brut.updated_at === 'string' ? brut.updated_at : undefined,
  };
}

export function normaliserPartenaireStrategique(brut: unknown): SynthesePartenaireStrategique | null {
  if (!estObjet(brut) || typeof brut.id !== 'string') {
    return null;
  }
  const partenaire = estObjet(brut.partenaire) ? brut.partenaire : null;
  const nom =
    typeof brut.partenaire_nom === 'string'
      ? brut.partenaire_nom
      : partenaire && typeof partenaire.nom === 'string'
        ? partenaire.nom
        : undefined;

  return {
    id: brut.id,
    etablissement_id: typeof brut.etablissement_id === 'string' ? brut.etablissement_id : undefined,
    annee: brut.annee === undefined ? undefined : versNombre(brut.annee),
    partenaire_id: versTexte(brut.partenaire_id),
    partenaire_nom: nom,
    partenaire_logo_url:
      typeof brut.partenaire_logo_url === 'string'
        ? brut.partenaire_logo_url
        : partenaire && typeof partenaire.logo_url === 'string'
          ? partenaire.logo_url
          : null,
  };
}

/** Normalise la synthèse d'un établissement (GET /synthese/:id). */
export function normaliserSyntheseEtablissement(brut: unknown, anneeDefaut = 0): SyntheseEtablissement {
  const source = estObjet(brut) ? brut : {};
  return {
    etablissement_id: versTexte(source.etablissement_id),
    etablissement_nom: versTexte(source.etablissement_nom, 'Établissement'),
    etablissement_logo_url:
      typeof source.etablissement_logo_url === 'string'
        ? source.etablissement_logo_url
        : null,
    annee: source.annee === undefined ? anneeDefaut : versNombre(source.annee),
    compteurs: normaliserCompteurs(source.compteurs),
    items: versTableau(source.items)
      .map(normaliserItem)
      .filter((item): item is SyntheseItem => item !== null),
    partenaires_strategiques: versTableau(source.partenaires_strategiques)
      .map(normaliserPartenaireStrategique)
      .filter((partenaire): partenaire is SynthesePartenaireStrategique => partenaire !== null),
  };
}

/** Normalise la synthèse globale (GET /synthese). */
export function normaliserSyntheseGlobale(brut: unknown, anneeDefaut = 0): SyntheseGlobale {
  const source = estObjet(brut) ? brut : {};
  return {
    annee: source.annee === undefined ? anneeDefaut : versNombre(source.annee),
    etablissements: versTableau(source.etablissements).map((etablissement) =>
      normaliserSyntheseEtablissement(etablissement, anneeDefaut),
    ),
  };
}

export interface GroupeItemSynthese {
  type: string;
  libelle: string;
  description: string;
  connu: boolean;
  item?: SyntheseItem;
}

/**
 * Regroupe les items par type, dans l'ordre de TYPES_ITEM_SYNTHESE puis, à la
 * suite, pour les types inconnus (robustesse si le backend en ajoute).
 */
export function grouperItemsParType(items: SyntheseItem[]): GroupeItemSynthese[] {
  const groupes: GroupeItemSynthese[] = TYPES_ITEM_SYNTHESE.map((definition) => ({
    type: definition.valeur,
    libelle: definition.libelle,
    description: definition.description,
    connu: true,
    item: items.find((item) => item.type === definition.valeur),
  }));

  const typesSupplementaires = items
    .filter((item) => !TYPES_CONNUS.has(item.type))
    .map((item) => item.type)
    .filter((type, index, tous) => tous.indexOf(type) === index);

  for (const type of typesSupplementaires) {
    groupes.push({
      type,
      libelle: libelleTypeItem(type),
      description: descriptionTypeItem(type),
      connu: false,
      item: items.find((item) => item.type === type),
    });
  }

  return groupes;
}

/** Nombre de types narratifs renseignés (0 à 3). */
export function nombreTypesRenseignes(items: SyntheseItem[]): number {
  return grouperItemsParType(items).filter((groupe) => Boolean(groupe.item)).length;
}

/** Complétude de la synthèse narrative, en pourcentage (0 à 100). */
export function tauxCompletudeSynthese(items: SyntheseItem[]): number {
  const total = grouperItemsParType(items).length;
  if (total === 0) return 0;
  return Math.round((nombreTypesRenseignes(items) / total) * 100);
}

/** Valide la valeur d'un item narratif ; renvoie un message d'erreur ou null. */
export function validerValeurItem(valeur: string): string | null {
  const nettoyee = valeur.trim();
  if (nettoyee.length === 0) {
    return 'La valeur est obligatoire.';
  }
  if (nettoyee.length < LONGUEUR_MIN_VALEUR) {
    return `La valeur doit contenir au moins ${LONGUEUR_MIN_VALEUR} caractères.`;
  }
  return null;
}

/** Additionne les compteurs de plusieurs établissements. */
export function totaliserCompteurs(etablissements: SyntheseEtablissement[]): SyntheseCompteurs {
  return etablissements.reduce<SyntheseCompteurs>((total, etablissement) => {
    const compteurs = etablissement.compteurs ?? compteursVides();
    return {
      partenaires: total.partenaires + versNombre(compteurs.partenaires),
      conventions_actives: total.conventions_actives + versNombre(compteurs.conventions_actives),
      conventions_expirees: total.conventions_expirees + versNombre(compteurs.conventions_expirees),
      cotutelles: total.cotutelles + versNombre(compteurs.cotutelles),
      projets_actifs: total.projets_actifs + versNombre(compteurs.projets_actifs),
    };
  }, compteursVides());
}

export interface TotauxSynthese {
  compteurs: SyntheseCompteurs;
  elements_narratifs: number;
  elements_attendus: number;
  partenaires_strategiques: number;
  etablissements_complets: number;
  taux_completude: number;
}

/** Totaux consolidés affichés en tête de la synthèse globale. */
export function totaliserSyntheseGlobale(etablissements: SyntheseEtablissement[]): TotauxSynthese {
  const elements_attendus = etablissements.reduce(
    (total, etablissement) => total + grouperItemsParType(etablissement.items).length,
    0,
  );
  const elements_narratifs = etablissements.reduce(
    (total, etablissement) => total + nombreTypesRenseignes(etablissement.items),
    0,
  );
  const partenaires_strategiques = etablissements.reduce(
    (total, etablissement) => total + etablissement.partenaires_strategiques.length,
    0,
  );
  const etablissements_complets = etablissements.filter((etablissement) => {
    const groupes = grouperItemsParType(etablissement.items);
    return groupes.length > 0 && groupes.every((groupe) => Boolean(groupe.item));
  }).length;

  return {
    compteurs: totaliserCompteurs(etablissements),
    elements_narratifs,
    elements_attendus,
    partenaires_strategiques,
    etablissements_complets,
    taux_completude: elements_attendus === 0 ? 0 : Math.round((elements_narratifs / elements_attendus) * 100),
  };
}

export interface LigneComparatifEtablissement {
  etablissement_id: string;
  etablissement_nom: string;
  etablissement_logo_url: string | null;
  libelle_court: string;
  partenaires: number;
  conventions_actives: number;
  conventions_expirees: number;
  cotutelles: number;
  projets_actifs: number;
  elements_narratifs: number;
  elements_attendus: number;
  partenaires_strategiques: number;
  completude: number;
}

/** Données du comparatif (graphique + tableau) par établissement. */
export function construireComparatif(etablissements: SyntheseEtablissement[]): LigneComparatifEtablissement[] {
  return etablissements.map((etablissement) => {
    const groupes = grouperItemsParType(etablissement.items);
    return {
      etablissement_id: etablissement.etablissement_id,
      etablissement_nom: etablissement.etablissement_nom,
      etablissement_logo_url: etablissement.etablissement_logo_url ?? null,
      libelle_court: tronquerLibelle(etablissement.etablissement_nom),
      partenaires: etablissement.compteurs.partenaires,
      conventions_actives: etablissement.compteurs.conventions_actives,
      conventions_expirees: etablissement.compteurs.conventions_expirees,
      cotutelles: etablissement.compteurs.cotutelles,
      projets_actifs: etablissement.compteurs.projets_actifs,
      elements_narratifs: groupes.filter((groupe) => Boolean(groupe.item)).length,
      elements_attendus: groupes.length,
      partenaires_strategiques: etablissement.partenaires_strategiques.length,
      completude: tauxCompletudeSynthese(etablissement.items),
    };
  });
}
