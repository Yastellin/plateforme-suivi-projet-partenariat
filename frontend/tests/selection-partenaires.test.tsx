// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SelectionPartenaires } from '@/features/partenariats/components/SelectionPartenaires';

const etat = vi.hoisted(() => ({
  data: [] as { id: string; nom: string; type: string; pays: string }[],
  isLoading: false,
}));

vi.mock('@/features/partenaires/api/usePartenaires', () => ({
  usePartenaires: () => ({ data: { data: etat.data }, isLoading: etat.isLoading }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (valeur: string) => valeur,
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

async function saisirRecherche(valeur: string) {
  const entree = conteneur.querySelector<HTMLInputElement>('input[type="search"]');
  expect(entree).not.toBeNull();
  const definirValeur = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  await act(async () => {
    definirValeur?.call(entree, valeur);
    entree?.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

beforeEach(() => {
  etat.data = [];
  etat.isLoading = false;
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('création d’un partenaire depuis l’étape Partenaires', () => {
  it('propose le nom saisi seulement lorsque la recherche ne renvoie aucun résultat', async () => {
    const onCreerPartenaire = vi.fn();
    await act(async () => {
      racine.render(
        createElement(SelectionPartenaires, {
          selection: [],
          libelles: {},
          onChange: vi.fn(),
          onCreerPartenaire,
        }),
      );
    });

    expect(conteneur.querySelector('button')).toBeNull();
    await saisirRecherche('Partenaire introuvable');

    const bouton = Array.from(conteneur.querySelectorAll('button')).find((element) =>
      element.textContent?.includes('Créer un nouveau partenaire'),
    );
    expect(bouton?.textContent).toContain('“Partenaire introuvable”');
    await act(async () => bouton?.click());
    expect(onCreerPartenaire).toHaveBeenCalledWith('Partenaire introuvable');

    etat.data = [{ id: 'partenaire-1', nom: 'Partenaire introuvable', type: 'ONG', pays: 'Madagascar' }];
    await act(async () => {
      racine.render(
        createElement(SelectionPartenaires, {
          selection: [],
          libelles: {},
          onChange: vi.fn(),
          onCreerPartenaire,
        }),
      );
    });
    await saisirRecherche('Partenaire introuvable');
    expect(
      Array.from(conteneur.querySelectorAll('button')).some((element) =>
        element.textContent?.includes('Créer un nouveau partenaire'),
      ),
    ).toBe(false);
  });
});
