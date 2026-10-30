// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarInterne } from '@/components/layout/SidebarInterne';

const etat = vi.hoisted(() => ({
  deconnecter: vi.fn(),
  utilisateur: {
    id: 'rakoto',
    email: 'rakoto@univ-fianarantsoa.mg',
    role: 'PRESIDENCE',
    etablissement_id: null as string | null,
    etablissement_nom: null as string | null,
  },
  etablissement: undefined as
    | { id: string; nom: string; logo_url: string | null }
    | undefined,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    utilisateur: etat.utilisateur,
    deconnecter: etat.deconnecter,
  }),
}));

vi.mock('@/features/etablissements/api/useEtablissement', () => ({
  useEtablissement: () => ({ data: etat.etablissement }),
}));

vi.mock('@/router', () => ({
  cheminTableauDeBord: () => '/presidence',
}));

vi.mock('@/features/notifications/api/useNombreNotificationsNonLues', () => ({
  useNombreNotificationsNonLues: () => ({ data: 27 }),
}));

vi.mock('@/features/messages-contact/api/useMessagesContact', () => ({
  useNombreMessagesNonLus: () => ({ data: 3 }),
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
  Object.assign(etat.utilisateur, {
    id: 'rakoto',
    email: 'rakoto@univ-fianarantsoa.mg',
    role: 'PRESIDENCE',
    etablissement_id: null,
    etablissement_nom: null,
  });
  etat.etablissement = undefined;
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

    // Avatar aux initiales du compte (pas d'image)
    expect(conteneur.querySelector('aside img')).toBeNull();
    expect(conteneur.querySelector('aside')?.textContent).toContain('RA');

    const boutonDeconnexion = conteneur.querySelector<HTMLButtonElement>(
      'button[aria-label="Se déconnecter"]',
    );
    expect(boutonDeconnexion).not.toBeNull();

    await act(async () => {
      boutonDeconnexion?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(etat.deconnecter).toHaveBeenCalledOnce();
  });

  it("affiche le nom de l'établissement dans le pied de page", async () => {
    Object.assign(etat.utilisateur, {
      id: 'compte-fds',
      email: 'direction@univ-fianarantsoa.mg',
      role: 'ETABLISSEMENT',
      etablissement_id: 'fds',
      etablissement_nom: 'Faculté des Sciences',
    });
    etat.etablissement = {
      id: 'fds',
      nom: 'Faculté des Sciences',
      logo_url: '/uploads/logos/etablissements/fds/logo-fds.png',
    };

    await act(async () => {
      racine.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/etablissement'] },
          createElement(SidebarInterne),
        ),
      );
    });

    const pied = conteneur.querySelector('aside')?.textContent ?? '';
    expect(pied).toContain('Faculté des Sciences');
    expect(pied).toContain('direction');
    expect(pied).toContain('DI');
  });
});
