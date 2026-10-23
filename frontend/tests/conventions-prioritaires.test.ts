import { describe, expect, it } from 'vitest';

import { selectionnerConventionsPrioritaires } from '@/features/tableau-de-bord/lib/conventions-prioritaires';
import type { Convention, StatutConvention } from '@/types/api';

const MAINTENANT = new Date('2026-01-15T12:00:00.000Z').getTime();

function convention(
  id: string,
  statut: StatutConvention,
  dateFin?: string,
): Convention {
  return {
    id,
    reference: `CONV-${id}`,
    titre: `Convention ${id}`,
    statut,
    date_fin: dateFin,
    archive: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('sélection des conventions prioritaires', () => {
  it('classe les conventions par urgence et ignore une convention active éloignée', () => {
    const resultat = selectionnerConventionsPrioritaires(
      [
        convention('brouillon', 'BROUILLON'),
        convention('saine', 'ACTIVE', '2026-06-30T00:00:00.000Z'),
        convention('proche', 'ACTIVE', '2026-01-20T00:00:00.000Z'),
        convention('signature', 'EN_ATTENTE_SIGNATURE'),
        convention('expiree', 'EXPIREE', '2026-01-01T00:00:00.000Z'),
        convention('suspendue', 'SUSPENDUE'),
      ],
      MAINTENANT,
    );

    expect(resultat.map((element) => element.id)).toEqual([
      'expiree',
      'signature',
      'proche',
      'suspendue',
      'brouillon',
    ]);
    expect(resultat.map((element) => element.id)).not.toContain('saine');
  });

  it('limite le tableau de bord aux cinq premières priorités', () => {
    const resultat = selectionnerConventionsPrioritaires(
      Array.from({ length: 8 }, (_, index) =>
        convention(
          `expiree-${index}`,
          'EXPIREE',
          new Date(MAINTENANT - (index + 1) * 86_400_000).toISOString(),
        ),
      ),
      MAINTENANT,
    );

    expect(resultat).toHaveLength(5);
    expect(resultat.map((element) => element.id)).toEqual([
      'expiree-7',
      'expiree-6',
      'expiree-5',
      'expiree-4',
      'expiree-3',
    ]);
  });
});
