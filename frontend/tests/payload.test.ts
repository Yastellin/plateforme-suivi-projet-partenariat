import { describe, expect, it } from 'vitest';

import {
  estPayloadNormalisable,
  normaliserPayload,
  videsEnNull,
} from '../src/lib/payload';

describe('normaliserPayload', () => {
  it('remplace les chaines vides par null', () => {
    const resultat = normaliserPayload({
      reference: 'CONV-1',
      date_fin: '',
      partenariat_id: '',
      description: '   ',
    }) as Record<string, unknown>;

    expect(resultat).toEqual({
      reference: 'CONV-1',
      date_fin: null,
      partenariat_id: null,
      description: null,
    });
  });

  it('convertit les trois liens vides d une convention en null', () => {
    expect(
      normaliserPayload({
        partenariat_id: '',
        projet_id: '',
        cotutelle_id: '',
      }),
    ).toEqual({
      partenariat_id: null,
      projet_id: null,
      cotutelle_id: null,
    });
  });

  it('descend dans les objets imbriques et les listes', () => {
    const resultat = normaliserPayload({
      projet: { projet_id: '', titre: 'ok' },
      beneficiaires_ids: ['', 'id-1'],
    }) as Record<string, any>;

    expect(resultat.projet).toEqual({ projet_id: null, titre: 'ok' });
    expect(resultat.beneficiaires_ids).toEqual([null, 'id-1']);
  });

  it('preserve les autres types', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    const resultat = normaliserPayload({
      budget: 0,
      actif: false,
      date,
      fichier: null,
    }) as Record<string, unknown>;

    expect(resultat.budget).toBe(0);
    expect(resultat.actif).toBe(false);
    expect(resultat.date).toBe(date);
    expect(resultat.fichier).toBeNull();
  });

  it('conserve les valeurs texte inchangees (espaces compris)', () => {
    expect(normaliserPayload('  texte  ')).toBe('  texte  ');
  });
});

describe('estPayloadNormalisable', () => {
  it('accepte les objets simples et les listes', () => {
    expect(estPayloadNormalisable({ a: '' })).toBe(true);
    expect(estPayloadNormalisable([{ a: '' }])).toBe(true);
  });

  it('refuse ce qui ne doit pas etre transforme', () => {
    expect(estPayloadNormalisable(new FormData())).toBe(false);
    expect(estPayloadNormalisable('texte')).toBe(false);
    expect(estPayloadNormalisable(null)).toBe(false);
    expect(estPayloadNormalisable(new Date())).toBe(false);
  });
});

describe('videsEnNull', () => {
  it('ne traite que le premier niveau', () => {
    expect(videsEnNull({ a: '', b: { c: '' } })).toEqual({
      a: null,
      b: { c: '' },
    });
  });
});
