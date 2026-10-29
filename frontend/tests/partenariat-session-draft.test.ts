// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CLE_BROUILLON_PARTENARIAT_SESSION,
  lireBrouillonPartenariatSession,
} from '@/features/partenariats/session-draft';

beforeEach(() => window.sessionStorage.clear());

describe('brouillon de partenariat en session', () => {
  it('lit l’état sauvegardé sous la clé de retour du wizard', () => {
    const brouillon = {
      formulaire: {
        intitule: 'Coopération',
        objet: '',
        domaine: 'RECHERCHE',
        date_debut: '2026-11-01',
        date_fin: '',
        partenaires_ids: ['partenaire-1'],
        etablissements_ids: [],
      },
      libelles: { 'partenaire-1': 'Partenaire existant' },
      etape: 0,
      version: 2,
      nomPartenaire: 'Partenaire à créer',
    };
    window.sessionStorage.setItem(CLE_BROUILLON_PARTENARIAT_SESSION, JSON.stringify(brouillon));

    expect(lireBrouillonPartenariatSession()).toEqual(brouillon);
  });

  it('supprime un brouillon corrompu au lieu de bloquer le retour', () => {
    window.sessionStorage.setItem(CLE_BROUILLON_PARTENARIAT_SESSION, '{invalide');

    expect(lireBrouillonPartenariatSession()).toBeNull();
    expect(window.sessionStorage.getItem(CLE_BROUILLON_PARTENARIAT_SESSION)).toBeNull();
  });
});
