// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarInterne } from '@/components/layout/SidebarInterne';

const etat = vi.hoisted(() => ({
  deconnecter: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    utilisateur: {
      id: 'rakoto',
      email: 'rakoto@univ-toliara.mg',
      role: 'PRESIDENCE',
      etablissement_nom: null,
    },
    deconnecter: etat.deconnecter,
  }),
}));

vi.mock('@/router', () => ({
  cheminTableauDeBord: () => '/presidence',
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

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  etat.deconnecter.mockReset();
  window.localStorage.clear();
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('barre latérale interne', () => {
  it('garde le compte visible sous une navigation défilable et expose la déconnexion', async () => {
    await act(async () => {
      racine.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/presidence'] },
          createElement(SidebarInterne),
        ),
      );
    });

    expect(conteneur.querySelector('nav')?.className).toContain('overflow-y-auto');

    const lienNotifications = conteneur.querySelector<HTMLAnchorElement>(
      'a[href="/presidence/notifications"]',
    );
    expect(lienNotifications?.textContent).toContain('Notifications');
    expect(lienNotifications?.textContent).toContain('27');

    const boutonCompte = conteneur.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="menu"]',
    );
    expect(boutonCompte).not.toBeNull();
    expect(
      boutonCompte?.querySelector('img')?.getAttribute('src'),
    ).toBe('/api/uploads/logos/presidence/logo-universite.png');

    await act(async () => {
      boutonCompte?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const boutonDeconnexion = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>('button'),
    ).find((bouton) => bouton.textContent?.includes('Se déconnecter'));
    expect(boutonDeconnexion).toBeDefined();

    await act(async () => {
      boutonDeconnexion?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(etat.deconnecter).toHaveBeenCalledOnce();
  });
});
