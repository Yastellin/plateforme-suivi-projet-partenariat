// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from '@/features/auth/components/LoginForm';

interface OptionsMutation {
  onSuccess?: (reponse: {
    access_token: string;
    refresh_token: string;
    utilisateur: { id: string; email: string; role: 'ETABLISSEMENT' };
  }) => void;
  onError?: (erreur: Error) => void;
}

const etat = vi.hoisted(() => ({
  mutate: vi.fn(),
  connecter: vi.fn(),
  erreurToast: vi.fn(),
}));

vi.mock('@/features/auth/api/useLogin', () => ({
  useLogin: () => ({ mutate: etat.mutate, isPending: false }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ connecter: etat.connecter }),
}));

vi.mock('@/hooks/useBlocageTemporaire', () => ({
  useBlocageTemporaire: () => ({
    secondesRestantes: 0,
    bloque: false,
    bloquer: vi.fn(),
    estTropDeRequetes: () => false,
  }),
}));

vi.mock('sonner', () => ({
  toast: { error: etat.erreurToast },
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

async function monter() {
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);

  await act(async () => {
    racine.render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/connexion'] },
        createElement(LoginForm),
      ),
    );
  });
}

async function saisir(nom: string, valeur: string) {
  const entree = conteneur.querySelector<HTMLInputElement>(`input[name="${nom}"]`);
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

async function cocherSouvenir() {
  const caseSouvenir = conteneur.querySelector<HTMLInputElement>(
    'input[name="seSouvenir"]',
  );
  expect(caseSouvenir).not.toBeNull();
  await act(async () => {
    caseSouvenir?.click();
  });
}

async function soumettre() {
  await act(async () => {
    conteneur
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  etat.mutate.mockReset();
  etat.connecter.mockReset();
  etat.erreurToast.mockReset();
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('formulaire de connexion', () => {
  it('demande une session persistante lorsque « Se souvenir de moi » est coché', async () => {
    etat.mutate.mockImplementation(
      (_variables: unknown, options: OptionsMutation) => {
        options.onSuccess?.({
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          utilisateur: {
            id: 'utilisateur-fds',
            email: 'fds@univ-fianarantsoa.mg',
            role: 'ETABLISSEMENT',
          },
        });
      },
    );
    await monter();

    await saisir('email', 'fds@univ-fianarantsoa.mg');
    await saisir('motDePasse', 'password123');
    await cocherSouvenir();
    await soumettre();

    expect(etat.connecter).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'fds@univ-fianarantsoa.mg' }),
      'access-token',
      'refresh-token',
      true,
    );
  });

  it('affiche le motif explicite envoyé pour un compte désactivé', async () => {
    const message =
      'Votre compte a été désactivé. Veuillez contacter la Présidence.';
    etat.mutate.mockImplementation(
      (_variables: unknown, options: OptionsMutation) => {
        options.onError?.(new Error(message));
      },
    );
    await monter();

    await saisir('email', 'fds@univ-fianarantsoa.mg');
    await saisir('motDePasse', 'password123');
    await soumettre();

    expect(etat.erreurToast).toHaveBeenCalledWith('Compte désactivé', {
      description: message,
    });
    expect(etat.erreurToast).not.toHaveBeenCalledWith(
      'Identifiant ou mot de passe incorrect',
      expect.anything(),
    );
  });
});
