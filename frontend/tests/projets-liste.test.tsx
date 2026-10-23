// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjetsListePage } from '@/features/projets/pages/ProjetsListePage';
import { formaterDate } from '@/lib/format';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    utilisateur: {
      id: 'rakoto',
      email: 'rakoto@presidence.mg',
      role: 'PRESIDENCE',
      etablissement_nom: null,
    },
  }),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    peutCreer: false,
    peutModifier: true,
    peutSoumettre: false,
  }),
}));

vi.mock('@/features/projets/api/useSoumettreEnMasseProjets', () => ({
  useSoumettreEnMasseProjets: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('@/features/projets/api/useProjets', () => ({
  useProjets: () => ({
    isLoading: false,
    data: {
      data: [
        {
          id: 'projet-presidence',
          nom: 'Cartographie numérique de l’Itasy',
          type: 'Recherche',
          date_debut: '2026-11-10T00:00:00.000Z',
          date_fin_prevue: '2027-06-30T00:00:00.000Z',
          avancement: 25,
          en_retard: false,
          statut: 'EN_COURS',
          archive: false,
          soumis_le: null,
          publie_le: null,
          cree_par_role: 'PRESIDENCE',
        },
        {
          id: 'projet-etablissement',
          nom: 'Valorisation agricole à Toliara',
          type: 'Développement',
          date_debut: '2026-12-01T00:00:00.000Z',
          date_fin_prevue: '2027-08-15T00:00:00.000Z',
          avancement: 10,
          en_retard: false,
          statut: 'EN_ATTENTE',
          archive: false,
          soumis_le: '2026-10-23T08:00:00.000Z',
          publie_le: null,
          cree_par_role: 'ETABLISSEMENT',
        },
      ],
      meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
    },
  }),
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('liste des projets', () => {
  it('affiche la date de début et ne propose à la Présidence que ses propres projets en modification', async () => {
    await act(async () => {
      racine.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/presidence/projets'] },
          createElement(ProjetsListePage),
        ),
      );
    });

    expect(conteneur.textContent).toContain('Date de début');
    expect(conteneur.textContent).toContain(
      formaterDate('2026-11-10T00:00:00.000Z'),
    );
    expect(
      conteneur.querySelector(
        'a[aria-label="Modifier Cartographie numérique de l’Itasy"]',
      ),
    ).not.toBeNull();
    expect(
      conteneur.querySelector(
        'a[aria-label="Modifier Valorisation agricole à Toliara"]',
      ),
    ).toBeNull();
  });
});
