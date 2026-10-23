import { describe, expect, it } from 'vitest';

import { normaliserResultatsDoublons } from '@/features/partenaires/api/useRechercheDoublon';

const DOUBLON = {
  id: 'partenaire-rakoto',
  nom: 'Université de Toliara',
  raisons_doublon: ['nom identique', 'pays identique'],
};

describe('normalisation de la recherche de doublons partenaire', () => {
  it('conserve la réponse tableau attendue', () => {
    expect(normaliserResultatsDoublons([DOUBLON])).toEqual([DOUBLON]);
  });

  it('déplie les réponses paginées ou doublement enveloppées', () => {
    expect(
      normaliserResultatsDoublons({
        data: { data: [DOUBLON], meta: { total: 1 } },
      }),
    ).toEqual([DOUBLON]);
  });

  it('retourne une liste vide pour une réponse inattendue', () => {
    expect(normaliserResultatsDoublons({ message: 'Réponse obsolète' })).toEqual(
      [],
    );
    expect(normaliserResultatsDoublons([{ id: 'incomplet' }])).toEqual([]);
    expect(normaliserResultatsDoublons(null)).toEqual([]);
  });
});
