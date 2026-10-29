// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PartenaireForm } from '@/features/partenaires/components/PartenaireForm';
import type { PartenaireFormValues } from '@/lib/validators/partenaire.schema';

vi.mock('@/features/partenaires/api/useRechercheDoublon', () => ({
  useRechercheDoublon: () => ({ data: [] }),
  useRechercheDoublonsPartenaireCoordonnees: () => ({ data: [] }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (valeur: unknown) => valeur,
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

describe('formulaire de partenaire', () => {
  it('affiche Annuler après Enregistrer sans soumettre le formulaire', async () => {
    const onAnnuler = vi.fn();
    const onSoumettre = vi.fn<(valeurs: PartenaireFormValues) => void>();

    await act(async () => {
      racine.render(
        createElement(PartenaireForm, {
          onAnnuler,
          onSoumettre,
          enCours: false,
        }),
      );
    });

    const boutons = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>('button'),
    );
    const enregistrer = boutons.find((bouton) =>
      bouton.textContent?.includes('Enregistrer'),
    );
    const annuler = boutons.find((bouton) =>
      bouton.textContent?.includes('Annuler'),
    );

    expect(enregistrer?.type).toBe('submit');
    expect(enregistrer?.parentElement?.className).toContain('flex-wrap');
    expect(enregistrer?.parentElement?.className).toContain('gap-3');
    expect(annuler?.type).toBe('button');
    expect(boutons.indexOf(annuler!)).toBe(boutons.indexOf(enregistrer!) + 1);
    expect(annuler?.className).toContain('border-[var(--color-border)]');
    expect(annuler?.className).toContain('text-[var(--color-text-secondary)]');

    await act(async () => annuler?.click());

    expect(onAnnuler).toHaveBeenCalledOnce();
    expect(onSoumettre).not.toHaveBeenCalled();
  });

  it('permet d’annuler la sélection d’un logo avant l’enregistrement', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:logo-selectionne'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });

    await act(async () => {
      racine.render(
        createElement(PartenaireForm, {
          onSoumettre: vi.fn(),
          enCours: false,
        }),
      );
    });

    const champLogo = conteneur.querySelector<HTMLInputElement>('input[type="file"]');
    expect(champLogo).not.toBeNull();
    await act(async () => {
      Object.defineProperty(champLogo, 'files', {
        configurable: true,
        value: [new File(['logo'], 'logo.png', { type: 'image/png' })],
      });
      champLogo?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(conteneur.querySelector('img')?.getAttribute('src')).toBe('blob:logo-selectionne');
    const boutonRetirer = Array.from(conteneur.querySelectorAll('button')).find(
      (bouton) => bouton.textContent?.includes('Retirer'),
    );
    expect(boutonRetirer).toBeDefined();
    await act(async () => boutonRetirer?.click());

    expect(conteneur.querySelector('img')?.getAttribute('src')).not.toBe('blob:logo-selectionne');
    expect(
      Array.from(conteneur.querySelectorAll('button')).some((bouton) =>
        bouton.textContent?.includes('Retirer'),
      ),
    ).toBe(false);
  });
});
