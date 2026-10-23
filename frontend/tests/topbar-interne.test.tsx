// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TopbarInterne } from '@/components/layout/TopbarInterne';

const etat = vi.hoisted(() => ({
  utilisateur: {
    id: 'rakoto',
    email: 'rakoto@presidence.mg',
    role: 'PRESIDENCE',
    etablissement_id: null as string | null,
    etablissement_nom: null as string | null,
  },
  etablissement: undefined as
    | { id: string; nom: string; logo_url: string | null }
    | undefined,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ utilisateur: etat.utilisateur }),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    estPresidence: etat.utilisateur.role === 'PRESIDENCE',
    estEtablissement: etat.utilisateur.role === 'ETABLISSEMENT',
  }),
}));

vi.mock('@/features/etablissements/api/useEtablissement', () => ({
  useEtablissement: () => ({ data: etat.etablissement }),
}));

vi.mock('@/features/notifications/api/useNombreNotificationsNonLues', () => ({
  useNombreNotificationsNonLues: () => ({ data: 27 }),
}));

vi.mock('@/contexts/identite-visuelle-context', () => ({
  NOM_INSTITUTION: 'Université de Fianarantsoa',
  useIdentiteVisuelle: () => ({
    logoUrl: '/uploads/logos/presidence/logo-universite.png',
  }),
}));

vi.mock('@/components/layout/Breadcrumbs', () => ({
  Breadcrumbs: () => createElement('span', null, 'Tableau de bord'),
}));

vi.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => createElement('button', { type: 'button' }, 'Thème'),
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  Object.assign(etat.utilisateur, {
    id: 'rakoto',
    email: 'rakoto@presidence.mg',
    role: 'PRESIDENCE',
    etablissement_id: null,
    etablissement_nom: null,
  });
  etat.etablissement = undefined;
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('barre supérieure interne', () => {
  it('affiche le logo de la Présidence dans la zone du compte', async () => {
    await act(async () => {
      racine.render(
        createElement(TopbarInterne, {
          onOuvrirRecherche: vi.fn(),
          onOuvrirNotifications: vi.fn(),
        }),
      );
    });

    expect(conteneur.textContent).toContain('rakoto');
    expect(conteneur.querySelector('img')?.getAttribute('src')).toBe(
      '/api/uploads/logos/presidence/logo-universite.png',
    );

    const boutonNotifications = conteneur.querySelector<HTMLButtonElement>(
      'button[aria-label="Ouvrir les notifications"]',
    );
    expect(boutonNotifications?.textContent).toBe('27');
    expect(
      boutonNotifications?.querySelector('[aria-label="27 notifications non lues"]'),
    ).not.toBeNull();
  });

  it("affiche le logo propre de l'établissement connecté", async () => {
    Object.assign(etat.utilisateur, {
      id: 'compte-ens',
      email: 'direction@ens-fianarantsoa.mg',
      role: 'ETABLISSEMENT',
      etablissement_id: 'ens',
      etablissement_nom: 'École Normale Supérieure',
    });
    etat.etablissement = {
      id: 'ens',
      nom: 'École Normale Supérieure',
      logo_url: '/uploads/logos/etablissements/ens/logo-ens.webp',
    };

    await act(async () => {
      racine.render(
        createElement(TopbarInterne, {
          onOuvrirRecherche: vi.fn(),
          onOuvrirNotifications: vi.fn(),
        }),
      );
    });

    expect(conteneur.querySelector('img')?.getAttribute('src')).toBe(
      '/api/uploads/logos/etablissements/ens/logo-ens.webp',
    );
    expect(conteneur.textContent).toContain('direction');
  });
});
