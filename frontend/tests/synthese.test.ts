// tests/synthese.test.ts
import { describe, expect, it } from 'vitest';

import {
  TYPES_ITEM_SYNTHESE,
  anneesSelectionnables,
  compteursVides,
  construireComparatif,
  descriptionTypeItem,
  grouperItemsParType,
  libelleTypeItem,
  nombreTypesRenseignes,
  normaliserCompteurs,
  normaliserSyntheseEtablissement,
  normaliserSyntheseGlobale,
  tauxCompletudeSynthese,
  totaliserCompteurs,
  totaliserSyntheseGlobale,
  tronquerLibelle,
  validerValeurItem,
} from '@/features/synthese/lib/synthese';
import type { SyntheseEtablissement, SyntheseItem } from '@/types/api';

function item(type: string, valeur: string, id = `item-${type}`): SyntheseItem {
  return { id, etablissement_id: 'etab-1', annee: 2026, type, valeur };
}

function etablissement(surcharge: Partial<SyntheseEtablissement> = {}): SyntheseEtablissement {
  return {
    etablissement_id: 'etab-1',
    etablissement_nom: 'Faculté des Sciences',
    annee: 2026,
    compteurs: compteursVides(),
    items: [],
    partenaires_strategiques: [],
    ...surcharge,
  };
}

describe('constantes de la synthèse', () => {
  it('expose les trois types narratifs du backend', () => {
    expect(TYPES_ITEM_SYNTHESE.map((type) => type.valeur)).toEqual([
      'DOMAINE_PRINCIPAL',
      'DEFI_MAJEUR',
      'PRIORITE_FUTURE',
    ]);
  });

  it('traduit un type connu et conserve un type inconnu', () => {
    expect(libelleTypeItem('DOMAINE_PRINCIPAL')).toBe('Domaine principal');
    expect(libelleTypeItem('AUTRE_TYPE')).toBe('AUTRE_TYPE');
    expect(descriptionTypeItem('DEFI_MAJEUR')).toContain('difficulté');
    expect(descriptionTypeItem('AUTRE_TYPE')).toBe('');
  });

  it('propose les années passées, l’année courante et la suivante', () => {
    expect(anneesSelectionnables(2026)).toEqual([2027, 2026, 2025, 2024, 2023, 2022, 2021]);
  });

  it('tronque les libellés longs pour les graphiques', () => {
    expect(tronquerLibelle('Court')).toBe('Court');
    expect(tronquerLibelle('Faculté des Sciences et Techniques', 18)).toHaveLength(18);
    expect(tronquerLibelle('Faculté des Sciences et Techniques', 18).endsWith('…')).toBe(true);
  });
});

describe('normalisation des réponses API', () => {
  it('complète les compteurs manquants avec des zéros', () => {
    expect(normaliserCompteurs(undefined)).toEqual(compteursVides());
    expect(normaliserCompteurs({ partenaires: '4', cotutelles: 2 })).toEqual({
      partenaires: 4,
      conventions_actives: 0,
      conventions_expirees: 0,
      cotutelles: 2,
      projets_actifs: 0,
    });
  });

  it('normalise la synthèse d’un établissement et écarte les items invalides', () => {
    const normalisee = normaliserSyntheseEtablissement(
      {
        etablissement_id: 'etab-1',
        etablissement_nom: 'FLSH',
        annee: 2025,
        compteurs: { partenaires: 3 },
        items: [{ id: 'a', etablissement_id: 'etab-1', annee: 2025, type: 'DEFI_MAJEUR', valeur: 'Budget' }, {}],
        partenaires_strategiques: [{ id: 'ps-1', partenaire_id: 'p-1', partenaire_nom: 'AUF' }],
      },
      2026,
    );

    expect(normalisee.etablissement_nom).toBe('FLSH');
    expect(normalisee.annee).toBe(2025);
    expect(normalisee.items).toHaveLength(1);
    expect(normalisee.partenaires_strategiques).toEqual([
      { id: 'ps-1', etablissement_id: undefined, annee: undefined, partenaire_id: 'p-1', partenaire_nom: 'AUF' },
    ]);
  });

  it('replie la synthèse globale sur l’année demandée quand elle est absente', () => {
    const globale = normaliserSyntheseGlobale({ etablissements: [{ etablissement_id: 'e1' }] }, 2030);

    expect(globale.annee).toBe(2030);
    expect(globale.etablissements).toHaveLength(1);
    expect(globale.etablissements[0].compteurs).toEqual(compteursVides());
  });

  it('tolère une réponse vide (aucun établissement)', () => {
    expect(normaliserSyntheseGlobale(undefined, 2026)).toEqual({ annee: 2026, etablissements: [] });
  });
});

describe('éléments narratifs', () => {
  it('regroupe les items par type, dans l’ordre du modèle', () => {
    const groupes = grouperItemsParType([item('PRIORITE_FUTURE', 'Énergie'), item('DOMAINE_PRINCIPAL', 'Biologie')]);

    expect(groupes.map((groupe) => groupe.type)).toEqual([
      'DOMAINE_PRINCIPAL',
      'DEFI_MAJEUR',
      'PRIORITE_FUTURE',
    ]);
    expect(groupes[0].item?.valeur).toBe('Biologie');
    expect(groupes[1].item).toBeUndefined();
    expect(groupes[2].item?.valeur).toBe('Énergie');
  });

  it('ajoute les types inconnus en fin de liste', () => {
    const groupes = grouperItemsParType([item('NOUVEAU_TYPE', 'Valeur libre')]);

    expect(groupes).toHaveLength(4);
    expect(groupes[3]).toMatchObject({ type: 'NOUVEAU_TYPE', libelle: 'NOUVEAU_TYPE', connu: false });
  });

  it('calcule le nombre de types renseignés et la complétude', () => {
    const items = [item('DOMAINE_PRINCIPAL', 'Biologie')];

    expect(nombreTypesRenseignes(items)).toBe(1);
    expect(tauxCompletudeSynthese(items)).toBe(33);
    expect(tauxCompletudeSynthese([])).toBe(0);
  });

  it('valide la valeur saisie (3 caractères minimum, espaces ignorés)', () => {
    expect(validerValeurItem('')).toBe('La valeur est obligatoire.');
    expect(validerValeurItem('   ')).toBe('La valeur est obligatoire.');
    expect(validerValeurItem(' ab ')).toBe('La valeur doit contenir au moins 3 caractères.');
    expect(validerValeurItem('abc')).toBeNull();
  });
});

describe('agrégations', () => {
  it('additionne les compteurs de plusieurs établissements', () => {
    const total = totaliserCompteurs([
      etablissement({
        compteurs: { partenaires: 5, conventions_actives: 2, conventions_expirees: 1, cotutelles: 1, projets_actifs: 4 },
      }),
      etablissement({
        compteurs: { partenaires: 3, conventions_actives: 6, conventions_expirees: 2, cotutelles: 0, projets_actifs: 2 },
      }),
    ]);

    expect(total).toEqual({
      partenaires: 8,
      conventions_actives: 8,
      conventions_expirees: 3,
      cotutelles: 1,
      projets_actifs: 6,
    });
  });

  it('consolide la campagne : complétude, établissements complets et partenaires stratégiques', () => {
    const totaux = totaliserSyntheseGlobale([
      etablissement({
        items: [
          item('DOMAINE_PRINCIPAL', 'Biologie'),
          item('DEFI_MAJEUR', 'Budget'),
          item('PRIORITE_FUTURE', 'Énergie'),
        ],
        partenaires_strategiques: [{ id: 'ps-1', partenaire_id: 'p-1', partenaire_nom: 'AUF' }],
      }),
      etablissement({ etablissement_id: 'etab-2', items: [item('DOMAINE_PRINCIPAL', 'Droit')] }),
    ]);

    expect(totaux.elements_narratifs).toBe(4);
    expect(totaux.elements_attendus).toBe(6);
    expect(totaux.taux_completude).toBe(67);
    expect(totaux.etablissements_complets).toBe(1);
    expect(totaux.partenaires_strategiques).toBe(1);
  });

  it('construit les lignes du comparatif (libellés courts et complétude)', () => {
    const lignes = construireComparatif([
      etablissement({
        etablissement_nom: 'Faculté des Sciences et Techniques',
        items: [item('DOMAINE_PRINCIPAL', 'Biologie')],
        compteurs: { partenaires: 7, conventions_actives: 3, conventions_expirees: 1, cotutelles: 2, projets_actifs: 5 },
      }),
    ]);

    expect(lignes[0]).toMatchObject({
      libelle_court: 'Faculté des Scien…',
      partenaires: 7,
      conventions_actives: 3,
      projets_actifs: 5,
      elements_narratifs: 1,
      elements_attendus: 3,
      completude: 33,
    });
  });
});
