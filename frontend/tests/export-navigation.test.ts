import { describe, expect, it } from 'vitest';
import { construireNavigation } from '../src/components/layout/navigation-interne';
import { filtresExportSchema, STATUTS_EXPORT } from '../src/features/export/types/export.types';

describe('espace Export de la Présidence', () => {
  it('ajoute uniquement une entrée Présidence vers la nouvelle route plurielle', () => {
    const navigation = construireNavigation('PRESIDENCE', '/presidence');
    const exportItem = navigation.flatMap((groupe) => groupe.items)
      .find((item) => item.cle === 'exports');

    expect(exportItem?.chemin).toBe('/presidence/exports');
    expect(
      construireNavigation('ETABLISSEMENT', '/etablissement')
        .flatMap((groupe) => groupe.items)
        .some((item) => item.cle === 'exports'),
    ).toBe(false);
    expect(
      construireNavigation('DECIDEUR', '/decideur')
        .flatMap((groupe) => groupe.items)
        .some((item) => item.cle === 'exports'),
    ).toBe(false);
  });

  it('refuse un intervalle inversé et accepte un filtre complet', () => {
    const filtre = {
      portee: 'TOUT',
      periode: {
        mode: 'INTERVALLE',
        champ_date: 'FIN',
        du: '2026-06-20',
        au: '2026-06-01',
      },
      statuts: [...STATUTS_EXPORT],
      format: 'CSV',
    };

    expect(filtresExportSchema.safeParse(filtre).success).toBe(false);
    expect(
      filtresExportSchema.safeParse({
        ...filtre,
        periode: { ...filtre.periode, au: '2026-06-30' },
      }).success,
    ).toBe(true);
  });
});
