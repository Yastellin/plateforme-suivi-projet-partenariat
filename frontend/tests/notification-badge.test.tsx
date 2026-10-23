// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';

const etat = vi.hoisted(() => ({ nombre: 27 }));

vi.mock('@/features/notifications/api/useNombreNotificationsNonLues', () => ({
  useNombreNotificationsNonLues: () => ({ data: etat.nombre }),
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  etat.nombre = 27;
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('badge des notifications', () => {
  it('affiche en rouge le nombre exact de notifications non lues', async () => {
    await act(async () => {
      racine.render(createElement(NotificationBadge));
    });

    const badge = conteneur.querySelector('span');
    expect(badge?.textContent).toBe('27');
    expect(badge?.className).toContain('bg-red-600');
    expect(badge?.getAttribute('aria-label')).toBe(
      '27 notifications non lues',
    );
  });

  it("n'affiche rien lorsqu'il n'y a aucune notification non lue", async () => {
    etat.nombre = 0;

    await act(async () => {
      racine.render(createElement(NotificationBadge));
    });

    expect(conteneur.childElementCount).toBe(0);
  });
});
