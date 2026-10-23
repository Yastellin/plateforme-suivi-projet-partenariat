// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TopbarInterne } from '@/components/layout/TopbarInterne';

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
    estPresidence: true,
    estEtablissement: false,
  }),
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
});
