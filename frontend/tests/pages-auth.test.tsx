// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MotDePasseOubliePage } from '@/features/auth/pages/MotDePasseOubliePage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

interface MutationSimulee {
  mutate: (variables: any, options?: { onSuccess?: (d: any) => void; onError?: (e: Error) => void }) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

const etat = vi.hoisted(() => ({
  demande: { mutate: () => {}, isPending: false, isSuccess: false, isError: false, error: null } as MutationSimulee,
  reinitialisation: {
    mutate: () => {},
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  } as MutationSimulee,
  appels: [] as unknown[],
}));

vi.mock('@/features/auth/api/useMotDePasseOublie', () => ({
  useMotDePasseOublie: () => etat.demande,
}));

vi.mock('@/features/auth/api/useReinitialiserMotDePasse', () => ({
  useReinitialiserMotDePasse: () => etat.reinitialisation,
}));

vi.mock('@/features/espace-public/api/usePublicAccueil', () => ({
  usePublicAccueil: () => ({ data: undefined, isLoading: false, isError: true }),
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

async function monter(page: ReactNode, chemin: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);

  await act(async () => {
    racine.render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(MemoryRouter, { initialEntries: [chemin] }, page),
      ),
    );
  });

  return conteneur;
}

function champ(texteLabel: string) {
  const label = Array.from(conteneur.querySelectorAll('label')).find((element) =>
    (element.textContent ?? '').trim().startsWith(texteLabel),
  );
  const id = label?.getAttribute('for');

  return id ? (document.getElementById(id) as HTMLInputElement) : null;
}

async function saisir(entree: HTMLInputElement, valeur: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  await act(async () => {
    setter?.call(entree, valeur);
    entree.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function soumettre() {
  const formulaire = conteneur.querySelector('form');
  expect(formulaire).not.toBeNull();

  await act(async () => {
    formulaire?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

function texte() {
  return conteneur.textContent ?? '';
}

function reinitialiserEtat() {
  etat.appels = [];
  etat.demande = { mutate: () => {}, isPending: false, isSuccess: false, isError: false, error: null };
  etat.reinitialisation = { mutate: () => {}, isPending: false, isSuccess: false, isError: false, error: null };
}

beforeEach(reinitialiserEtat);

afterEach(async () => {
  await act(async () => {
    racine.unmount();
  });
  conteneur.remove();
});

const MESSAGE_CONFIRMATION_ATTENDU = /Si un compte est associé à cette adresse/;
const ERREUR_429 = new Error('Trop de requetes. Veuillez reessayer dans quelques instants.');

describe('page mot de passe oublié', () => {
  it('affiche le formulaire de demande', async () => {
    await monter(createElement(MotDePasseOubliePage), '/mot-de-passe-oublie');

    expect(texte()).toContain('Mot de passe oublié');
    expect(champ('Adresse e-mail')).not.toBeNull();
    expect(texte()).toContain('Envoyer le lien');
    expect(texte()).toContain('Retour à la connexion');
  });

  it('bloque l’envoi quand l’adresse est invalide', async () => {
    etat.demande.mutate = vi.fn();
    await monter(createElement(MotDePasseOubliePage), '/mot-de-passe-oublie');

    await saisir(champ('Adresse e-mail')!, 'pas-une-adresse');
    await soumettre();

    expect(etat.demande.mutate).not.toHaveBeenCalled();
    expect(texte()).toContain('Adresse e-mail invalide');
  });

  it('affiche la confirmation et ne transmet que l’adresse', async () => {
    etat.demande.mutate = (email, options) => {
      etat.appels.push(email);
      options?.onSuccess?.({ message: 'ok' });
    };
    await monter(createElement(MotDePasseOubliePage), '/mot-de-passe-oublie');

    await saisir(champ('Adresse e-mail')!, 'presidence@univ-fianarantsoa.mg');
    await soumettre();

    expect(etat.appels).toEqual(['presidence@univ-fianarantsoa.mg']);
    expect(texte()).toMatch(MESSAGE_CONFIRMATION_ATTENDU);
    expect(texte()).toContain('presidence@univ-fianarantsoa.mg');
    expect(texte()).toContain('Renvoyer un lien');
  });

  it('affiche la même confirmation quand l’adresse est inconnue', async () => {
    etat.demande.mutate = (email, options) => {
      etat.appels.push(email);
      options?.onError?.(new Error('Si un compte existe avec cet e-mail, un lien a ete envoye.'));
    };
    await monter(createElement(MotDePasseOubliePage), '/mot-de-passe-oublie');

    await saisir(champ('Adresse e-mail')!, 'inconnu@univ-fianarantsoa.mg');
    await soumettre();

    expect(texte()).toMatch(MESSAGE_CONFIRMATION_ATTENDU);
    expect(texte()).not.toContain('Aucun compte');
  });

  it('désactive le formulaire après un rejet pour trop de requêtes', async () => {
    etat.demande.mutate = (_email, options) => options?.onError?.(ERREUR_429);
    await monter(createElement(MotDePasseOubliePage), '/mot-de-passe-oublie');

    await saisir(champ('Adresse e-mail')!, 'presidence@univ-fianarantsoa.mg');
    await soumettre();

    expect(texte()).not.toMatch(MESSAGE_CONFIRMATION_ATTENDU);
    expect(texte()).toMatch(/Réessayez dans \d+s/);
    expect(conteneur.querySelector('button[type="submit"]')?.hasAttribute('disabled')).toBe(true);
  });
});

describe('page de réinitialisation', () => {
  it('explique le problème quand le jeton est absent', async () => {
    await monter(createElement(ResetPasswordPage), '/reset-password');

    expect(texte()).toContain('Lien incomplet');
    expect(texte()).toContain('Demander un nouveau lien');
    expect(conteneur.querySelector('form')).toBeNull();
  });

  it('valide les règles du mot de passe pendant la saisie', async () => {
    await monter(createElement(ResetPasswordPage), '/reset-password?token=jeton-de-test-123456');

    expect(champ('Nouveau mot de passe')).not.toBeNull();
    expect(champ('Confirmation du mot de passe')).not.toBeNull();

    await saisir(champ('Nouveau mot de passe')!, 'Motdepasse1');
    const regles = Array.from(conteneur.querySelectorAll('li')).map((element) => element.textContent);

    expect(regles).toContain('Une majuscule');
    expect(regles).toContain('Une minuscule');
    expect(regles).toContain('Un chiffre');
    expect(texte()).toContain('Définir le mot de passe');
  });

  it('refuse un mot de passe faible sans appeler l’API', async () => {
    etat.reinitialisation.mutate = vi.fn();
    await monter(createElement(ResetPasswordPage), '/reset-password?token=jeton-de-test-123456');

    await saisir(champ('Nouveau mot de passe')!, 'motdepasse');
    await saisir(champ('Confirmation du mot de passe')!, 'motdepasse');
    await soumettre();

    expect(etat.reinitialisation.mutate).not.toHaveBeenCalled();
    expect(texte()).toMatch(/majuscule/i);
    expect(texte()).toMatch(/8/);
  });

  it('refuse une confirmation différente', async () => {
    etat.reinitialisation.mutate = vi.fn();
    await monter(createElement(ResetPasswordPage), '/reset-password?token=jeton-de-test-123456');

    await saisir(champ('Nouveau mot de passe')!, 'Motdepasse1');
    await saisir(champ('Confirmation du mot de passe')!, 'Motdepasse2');
    await soumettre();

    expect(etat.reinitialisation.mutate).not.toHaveBeenCalled();
    expect(texte()).toMatch(/ne correspondent pas|identiques/i);
  });

  it('transmet le jeton et le nouveau mot de passe puis confirme', async () => {
    etat.reinitialisation.mutate = (variables, options) => {
      etat.appels.push(variables);
      options?.onSuccess?.({ message: 'ok' });
      etat.reinitialisation.isSuccess = true;
    };
    await monter(createElement(ResetPasswordPage), '/reset-password?token=jeton-de-test-123456');

    await saisir(champ('Nouveau mot de passe')!, 'Motdepasse1');
    await saisir(champ('Confirmation du mot de passe')!, 'Motdepasse1');
    await soumettre();

    expect(etat.appels).toEqual([{ token: 'jeton-de-test-123456', nouveauMotDePasse: 'Motdepasse1' }]);

    await act(async () => {});
    expect(texte()).toContain('Réinitialisation terminée');
    expect(texte()).toMatch(/sessions ouvertes/);
  });

  it('traduit le refus d’un jeton déjà utilisé', async () => {
    etat.reinitialisation.mutate = (_variables, options) => {
      etat.reinitialisation.isError = true;
      etat.reinitialisation.error = new Error('Token de reinitialisation deja utilise.');
      options?.onError?.(etat.reinitialisation.error);
    };
    await monter(createElement(ResetPasswordPage), '/reset-password?token=jeton-de-test-123456');

    await saisir(champ('Nouveau mot de passe')!, 'Motdepasse1');
    await saisir(champ('Confirmation du mot de passe')!, 'Motdepasse1');
    await soumettre();

    expect(texte()).toContain('Ce lien ne peut plus être utilisé');
    expect(texte()).toContain('Ce lien a déjà servi');
    expect(texte()).not.toContain('Token de reinitialisation deja utilise.');
  });

  it('désactive le formulaire après un rejet pour trop de requêtes', async () => {
    etat.reinitialisation.mutate = (_variables, options) => {
      etat.reinitialisation.isError = true;
      etat.reinitialisation.error = ERREUR_429;
      options?.onError?.(ERREUR_429);
    };
    await monter(createElement(ResetPasswordPage), '/reset-password?token=jeton-de-test-123456');

    await saisir(champ('Nouveau mot de passe')!, 'Motdepasse1');
    await saisir(champ('Confirmation du mot de passe')!, 'Motdepasse1');
    await soumettre();

    expect(texte()).toMatch(/Réessayez dans \d+s/);
    expect(conteneur.querySelector('button[type="submit"]')?.hasAttribute('disabled')).toBe(true);
    expect(texte()).not.toContain('Ce lien ne peut plus être utilisé');
  });
});
