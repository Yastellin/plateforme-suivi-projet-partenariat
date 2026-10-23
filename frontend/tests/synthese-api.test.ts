// tests/synthese-api.test.ts
//
// Vérifie la couche API du module synthèse face au contrat du backend :
// URLs, paramètres de requête et normalisation des réponses.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  default: api,
}));

import { recupererSyntheseGlobale } from '@/features/synthese/api/useSyntheseGlobale';
import { recupererSyntheseEtablissement } from '@/features/synthese/api/useSyntheseEtablissement';
import { recupererSyntheseItems as recupererItems } from '@/features/synthese/api/useSyntheseItems';
import { recupererPartenairesStrategiques } from '@/features/synthese/api/usePartenairesStrategiques';
import { recupererPartenairesPourSynthese } from '@/features/synthese/api/usePartenairesEtablissement';

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.delete.mockReset();
});

describe('GET /synthese', () => {
  it('demande l’année et normalise la synthèse globale', async () => {
    api.get.mockResolvedValue({
      data: {
        annee: 2026,
        etablissements: [
          {
            etablissement_id: 'etab-1',
            etablissement_nom: 'FDS',
            annee: 2026,
            compteurs: { partenaires: 4 },
            items: [],
            partenaires_strategiques: [],
          },
        ],
      },
    });

    const resultat = await recupererSyntheseGlobale(2026);

    expect(api.get).toHaveBeenCalledWith('/synthese', { params: { annee: 2026 } });
    expect(resultat.etablissements[0].compteurs).toEqual({
      partenaires: 4,
      conventions_actives: 0,
      conventions_expirees: 0,
      cotutelles: 0,
      projets_actifs: 0,
    });
  });
});

describe('GET /synthese/:etablissementId', () => {
  it('cible l’établissement et l’année', async () => {
    api.get.mockResolvedValue({
      data: {
        etablissement_id: 'etab-1',
        etablissement_nom: 'FLSH',
        annee: 2025,
        compteurs: {},
        items: [{ id: 'i1', etablissement_id: 'etab-1', annee: 2025, type: 'DEFI_MAJEUR', valeur: 'Budget' }],
        partenaires_strategiques: [],
      },
    });

    const resultat = await recupererSyntheseEtablissement('etab-1', 2025);

    expect(api.get).toHaveBeenCalledWith('/synthese/etab-1', { params: { annee: 2025 } });
    expect(resultat.items).toHaveLength(1);
    expect(resultat.etablissement_nom).toBe('FLSH');
  });
});

describe('GET /synthese/items', () => {
  it('transmet les filtres et déplie l’enveloppe { data, total }', async () => {
    api.get.mockResolvedValue({
      data: {
        total: 1,
        data: [{ id: 'i1', etablissement_id: 'etab-1', annee: 2026, type: 'DEFI_MAJEUR', valeur: 'Budget' }],
      },
    });

    const items = await recupererItems({ etablissement_id: 'etab-1', annee: 2026 });

    expect(api.get).toHaveBeenCalledWith('/synthese/items', {
      params: { etablissement_id: 'etab-1', annee: 2026, type: undefined },
    });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('i1');
  });

  it('tolère une réponse inattendue (aucune donnée)', async () => {
    api.get.mockResolvedValue({ data: undefined });

    await expect(recupererItems({})).resolves.toEqual([]);
  });
});

describe('GET /synthese/partenaires-strategiques', () => {
  it('renvoie la liste normalisée', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 'ps-1',
          partenaire_id: 'p-1',
          partenaire_nom: 'Université de Toliara',
          partenaire_logo_url: '/uploads/logos/partenaires/toliara.png',
        },
        { partenaire_id: 'p-2' },
      ],
    });

    const partenaires = await recupererPartenairesStrategiques({ etablissement_id: 'etab-1', annee: 2026 });

    expect(api.get).toHaveBeenCalledWith('/synthese/partenaires-strategiques', {
      params: { etablissement_id: 'etab-1', annee: 2026 },
    });
    expect(partenaires).toEqual([
      {
        id: 'ps-1',
        etablissement_id: undefined,
        annee: undefined,
        partenaire_id: 'p-1',
        partenaire_nom: 'Université de Toliara',
        partenaire_logo_url: '/uploads/logos/partenaires/toliara.png',
      },
    ]);
  });
});

describe('sélection des partenaires pour la désignation', () => {
  it('interroge /partenaires avec la recherche et l’établissement', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 'p-1',
            nom: 'Université de Toliara',
            etablissement_id: 'etab-1',
            statut: 'ACTIF',
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    });

    const page = await recupererPartenairesPourSynthese({ etablissement_id: 'etab-1', recherche: 'AUF' });

    expect(api.get).toHaveBeenCalledWith('/partenaires', {
      params: { page: 1, limit: 100, nom: 'AUF', etablissement_id: 'etab-1' },
    });
    expect(page.data).toHaveLength(1);
    expect(page.meta.total).toBe(1);
  });
});
