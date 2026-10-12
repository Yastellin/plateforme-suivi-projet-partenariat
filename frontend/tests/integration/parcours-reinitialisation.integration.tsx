// @vitest-environment jsdom
import { afterAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MotDePasseOubliePage } from '@/features/auth/pages/MotDePasseOubliePage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const COMPTE = process.env.COMPTE_INTEGRATION ?? 'presidence@univ-fianarantsoa.mg';
const MOT_DE_PASSE_DU_SEED = process.env.MOT_DE_PASSE_DU_SEED ?? 'password123';
const MOT_DE_PASSE_TEMPORAIRE = process.env.MOT_DE_PASSE_TEMPORAIRE ?? 'Integration2026x';
const MOT_DE_PASSE_FINAL = process.env.MOT_DE_PASSE_FINAL ?? 'Reinitialise2026x';
const COMMANDE_JOURNAL = process.env.COMMANDE_JOURNAL ?? '';
const FICHIER_JOURNAL = process.env.JOURNAL_BACKEND ?? '/tmp/api.log';

interface ReponseLogin {
  access_token: string;
  refresh_token: string;
}

async function appeler(chemin: string, corps: unknown) {
  const reponse = await fetch(`${URL_API}${chemin}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  });

  const charge = (await reponse.json().catch(() => ({}))) as Record<string, unknown>;

  return { statut: reponse.status, corps: (charge.data ?? charge) as Record<string, unknown> };
}

const FENETRE_LIMITATION_MS = 61000;

async function demanderLien(email: string) {
  for (let essai = 0; essai < 3; essai += 1) {
    const reponse = await appeler('/auth/mot-de-passe-oublie', { email });

    if (reponse.statut !== 429) {
      return reponse;
    }

    await new Promise((resoudre) => setTimeout(resoudre, FENETRE_LIMITATION_MS));
  }

  throw new Error("La limitation de débit (3 demandes par minute) reste active.");
}

async function reinitialiser(jeton: string, motDePasse: string) {
  for (let essai = 0; essai < 3; essai += 1) {
    const reponse = await appeler('/auth/reinitialiser-mot-de-passe', {
      token: jeton,
      nouveau_mot_de_passe: motDePasse,
    });

    if (reponse.statut !== 429) {
      return reponse;
    }

    await new Promise((resoudre) => setTimeout(resoudre, FENETRE_LIMITATION_MS));
  }

  throw new Error("La limitation de débit (5 réinitialisations par minute) reste active.");
}

async function connexion(email: string, motDePasse: string) {
  const { statut, corps } = await appeler('/auth/login', { email, mot_de_passe: motDePasse });

  return { statut, donnees: corps as unknown as ReponseLogin };
}

function journalBackend() {
  if (COMMANDE_JOURNAL) {
    return execSync(COMMANDE_JOURNAL, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  }

  return readFileSync(FICHIER_JOURNAL, 'utf8');
}

async function lireJetonDepuisJournal() {
  for (let tentative = 0; tentative < 20; tentative += 1) {
    const jetons = [...journalBackend().matchAll(/reset-password\?token=([A-Za-z0-9_-]{20,})/g)];

    if (jetons.length > 0) {
      return jetons[jetons.length - 1][1];
    }

    await new Promise((resoudre) => setTimeout(resoudre, 250));
  }

  throw new Error(
    `Aucun lien de réinitialisation trouvé. Renseignez JOURNAL_BACKEND (fichier de journal du backend) ou COMMANDE_JOURNAL (par exemple « docker compose logs backend »).`,
  );
}

let conteneur: HTMLDivElement;
let racine: Root;

async function afficher(page: ReactNode, chemin: string) {
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

  await act(async () => {
    formulaire?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resoudre) => setTimeout(resoudre, 700));
  });
}

function texte() {
  return conteneur.textContent ?? '';
}

afterAll(async () => {
  await act(async () => {
    racine?.unmount();
  });
  conteneur?.remove();
});

describe('parcours mot de passe oublié, du navigateur au serveur', () => {
  let jeton = '';

  it("accepte l'API et affiche la confirmation pour un compte existant", async () => {
    const ping = await fetch(`${URL_API}/health`).catch(() => null);
    expect(ping?.ok, `API injoignable sur ${URL_API}`).toBe(true);

    await afficher(createElement(MotDePasseOubliePage), '/mot-de-passe-oublie');
    await saisir(champ('Adresse e-mail')!, COMPTE);
    await soumettre();

    if (texte().includes('Réessayez dans')) {
      throw new Error('Limitation de débit atteinte : patientez une minute avant de relancer ce test.');
    }

    expect(texte()).toContain('Demande enregistrée');
    expect(texte()).toContain(COMPTE);
  });

  it('journalise un lien exploitable pour ce compte', async () => {
    jeton = await lireJetonDepuisJournal();
    expect(jeton).toMatch(/^[A-Za-z0-9_-]{20,}$/);
  });

  it('applique le nouveau mot de passe depuis la page de réinitialisation', async () => {
    await afficher(createElement(ResetPasswordPage), `/reset-password?token=${jeton}`);
    await saisir(champ('Nouveau mot de passe')!, MOT_DE_PASSE_TEMPORAIRE);
    await saisir(champ('Confirmation du mot de passe')!, MOT_DE_PASSE_TEMPORAIRE);
    await soumettre();

    expect(texte()).toContain('Réinitialisation terminée');
  });

  it('refuse le mot de passe précédent et accepte le nouveau', async () => {
    const nouveau = await connexion(COMPTE, MOT_DE_PASSE_TEMPORAIRE);
    expect(nouveau.statut).toBe(200);
    expect(nouveau.donnees.access_token).toBeTruthy();

    const ancien = await connexion(COMPTE, MOT_DE_PASSE_DU_SEED);
    expect(ancien.statut).toBe(401);
  });

  it('rejette la réutilisation du même lien', async () => {
    await afficher(createElement(ResetPasswordPage), `/reset-password?token=${jeton}`);
    await saisir(champ('Nouveau mot de passe')!, MOT_DE_PASSE_TEMPORAIRE);
    await saisir(champ('Confirmation du mot de passe')!, MOT_DE_PASSE_TEMPORAIRE);
    await soumettre();

    expect(texte()).toContain('Ce lien ne peut plus être utilisé');
    expect(texte()).toContain('Ce lien a déjà servi');
  });

  it(
    'laisse le compte sur un mot de passe robuste',
    { timeout: 200000 },
    async () => {
      expect((await demanderLien(COMPTE)).statut).toBe(200);
      const secondJeton = await lireJetonDepuisJournal();

      expect((await reinitialiser(secondJeton, MOT_DE_PASSE_FINAL)).statut).toBe(200);

      const retour = await connexion(COMPTE, MOT_DE_PASSE_FINAL);
      expect(retour.statut).toBe(200);
    },
  );
});
