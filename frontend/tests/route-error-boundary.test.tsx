// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteErrorBoundary } from '@/components/shared/ErrorBoundary';

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;
let espionConsole: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  espionConsole = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
  espionConsole.mockRestore();
});

function PageEnErreur(): never {
  throw new Error('Erreur technique volontaire');
}

describe('repli des erreurs de route', () => {
  it("remplace l'écran technique de React Router par une action compréhensible", async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: createElement(PageEnErreur),
        errorElement: createElement(RouteErrorBoundary),
      },
    ]);

    await act(async () => {
      racine.render(createElement(RouterProvider, { router }));
    });

    expect(conteneur.textContent).toContain("Cette page n'a pas pu s'afficher");
    expect(conteneur.textContent).toContain('Réessayer');
    expect(conteneur.textContent).not.toContain('Unexpected Application Error');
  });
});
