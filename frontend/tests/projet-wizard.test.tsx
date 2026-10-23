// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjetWizard } from '@/features/projets/components/ProjetWizard';

const etat = vi.hoisted(() => ({
  muter: vi.fn(),
  effacerBrouillon: vi.fn(),
}));

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

vi.mock('@/features/projets/api/useCreateProjet', () => ({
  useCreateProjet: () => ({
    isPending: false,
    mutate: etat.muter,
  }),
}));

vi.mock('@/features/etablissements/api/useEtablissements', () => ({
  useEtablissements: () => ({ data: { data: [] } }),
}));

vi.mock('@/components/forms/wizard/useWizardDraft', () => ({
  useWizardDraft: () => ({ effacerBrouillon: etat.effacerBrouillon }),
}));

vi.mock('@/features/projets/components/SelectionPorteur', () => ({
  SelectionPorteur: () => null,
}));
vi.mock('@/features/projets/components/SelectionBailleurs', () => ({
  SelectionBailleurs: () => null,
}));
vi.mock('@/features/projets/components/SelectionBeneficiaires', () => ({
  SelectionBeneficiaires: () => null,
}));
vi.mock('@/features/projets/components/SelectionSites', () => ({
  SelectionSites: () => null,
}));
vi.mock('sonner', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  etat.muter.mockReset();
  etat.effacerBrouillon.mockReset();
  window.localStorage.clear();
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('assistant de création de projet', () => {
  it('affiche les erreurs requises après une tentative de passage à l’étape suivante', async () => {
    await act(async () => {
      racine.render(
        createElement(ProjetWizard, {
          onSucces: vi.fn(),
          onAnnuler: vi.fn(),
        }),
      );
    });

    const suivant = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>('button'),
    ).find((bouton) => bouton.textContent?.includes('Suivant'));

    expect(suivant).toBeDefined();
    expect(suivant?.disabled).toBe(false);

    await act(async () => {
      suivant?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(conteneur.textContent).toContain('Le nom du projet est requis');
    expect(conteneur.textContent).toContain('Le type est requis');
    expect(conteneur.textContent).not.toContain(
      'Le nom doit contenir au moins 2 caractères',
    );
  });
});
