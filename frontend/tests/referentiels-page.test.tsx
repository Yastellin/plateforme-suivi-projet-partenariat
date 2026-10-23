// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ReferentielsPage } from '@/features/referentiels/pages/ReferentielsPage';

const mutation = { mutate: vi.fn() };

vi.mock('@/hooks/useDebounce', () => ({ useDebounce: (valeur: string) => valeur }));
vi.mock('@/features/referentiels/api/usePorteurs', () => ({
  usePorteurs: () => ({
    data: [
      {
        id: 'porteur-rakoto',
        nom: 'Rakoto Soa',
        type_porteur: 'PERSONNE',
        institution_rattachement: 'Université de Toliara',
      },
    ],
    isLoading: false,
  }),
}));
vi.mock('@/features/referentiels/api/useBailleurs', () => ({
  useBailleurs: () => ({
    data: [
      {
        id: 'bailleur-fihariana',
        nom: 'Fondation Fihariana',
        description: 'Appui aux initiatives malgaches',
      },
    ],
    isLoading: false,
  }),
}));
vi.mock('@/features/referentiels/api/useBeneficiaires', () => ({
  useBeneficiaires: () => ({
    data: [
      {
        id: 'beneficiaires-etudiants',
        nom: 'Étudiants de Fianarantsoa',
        categorie: 'Étudiants',
      },
    ],
    isLoading: false,
  }),
}));
vi.mock('@/features/referentiels/api/useSites', () => ({
  useSites: () => ({
    data: [
      {
        id: 'site-maninday',
        nom: 'Campus de Maninday',
        description: 'Toliara',
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/features/referentiels/api/useCreatePorteur', () => ({
  useCreatePorteur: () => mutation,
}));
vi.mock('@/features/referentiels/api/useUpdatePorteur', () => ({
  useUpdatePorteur: () => mutation,
}));
vi.mock('@/features/referentiels/api/useDeletePorteur', () => ({
  useDeletePorteur: () => mutation,
}));
vi.mock('@/features/referentiels/api/useCreateBailleur', () => ({
  useCreateBailleur: () => mutation,
}));
vi.mock('@/features/referentiels/api/useUpdateBailleur', () => ({
  useUpdateBailleur: () => mutation,
}));
vi.mock('@/features/referentiels/api/useDeleteBailleur', () => ({
  useDeleteBailleur: () => mutation,
}));
vi.mock('@/features/referentiels/api/useCreateBeneficiaire', () => ({
  useCreateBeneficiaire: () => mutation,
}));
vi.mock('@/features/referentiels/api/useUpdateBeneficiaire', () => ({
  useUpdateBeneficiaire: () => mutation,
}));
vi.mock('@/features/referentiels/api/useDeleteBeneficiaire', () => ({
  useDeleteBeneficiaire: () => mutation,
}));
vi.mock('@/features/referentiels/api/useCreateSite', () => ({
  useCreateSite: () => mutation,
}));
vi.mock('@/features/referentiels/api/useUpdateSite', () => ({
  useUpdateSite: () => mutation,
}));
vi.mock('@/features/referentiels/api/useDeleteSite', () => ({
  useDeleteSite: () => mutation,
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

async function ouvrirOnglet(libelle: string) {
  const onglet = Array.from(conteneur.querySelectorAll<HTMLButtonElement>('button')).find(
    (bouton) => bouton.textContent === libelle,
  );
  await act(async () => {
    onglet?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    onglet?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('page des référentiels', () => {
  it('affiche les tableaux renvoyés directement par les quatre endpoints', async () => {
    await act(async () => {
      racine.render(createElement(ReferentielsPage));
    });

    expect(conteneur.textContent).toContain('Rakoto Soa');

    await ouvrirOnglet('Bailleurs');
    expect(conteneur.textContent).toContain('Fondation Fihariana');

    await ouvrirOnglet('Bénéficiaires');
    expect(conteneur.textContent).toContain('Étudiants de Fianarantsoa');

    await ouvrirOnglet('Sites');
    expect(conteneur.textContent).toContain('Campus de Maninday');
  });
});
