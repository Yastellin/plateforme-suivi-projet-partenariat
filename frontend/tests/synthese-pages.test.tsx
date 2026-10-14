// tests/synthese-pages.test.tsx
//
// Parcours de la synthèse annuelle : page globale (compteurs consolidés,
// comparatif, navigation) et page établissement (éléments narratifs et
// partenaires stratégiques, gestion pour la Présidence, lecture seule pour
// le Décideur). L'API est simulée au niveau du client HTTP : les URL et les
// charges utiles envoyées sont donc vérifiées telles quelles.
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({ default: api }));

const auth = vi.hoisted(() => ({ role: 'PRESIDENCE' as 'PRESIDENCE' | 'DECIDEUR' }));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    utilisateur: {
      id: 'u-1',
      email: 'presidence@univ-fianarantsoa.mg',
      role: auth.role,
      etablissement_id: null,
      etablissement_nom: null,
    },
    estCharge: false,
  }),
}));

// Recharts a besoin de mesurer son conteneur : remplacé par un rendu minimal.
vi.mock('recharts', async () => {
  const react = await import('react');
  return {
    ResponsiveContainer: ({ children }: { children?: ReactNode }) => children ?? null,
    BarChart: ({ children, data }: { children?: ReactNode; data?: unknown[] }) =>
      react.createElement('div', { 'data-testid': 'comparatif', 'data-series': String(data?.length ?? 0) }, children),
    Bar: () => null,
    CartesianGrid: () => null,
    Legend: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
  };
});

import { SynthesePage } from '@/features/synthese/pages/SynthesePage';
import { SyntheseEtablissementPage } from '@/features/synthese/pages/SyntheseEtablissementPage';

const ANNEE = new Date().getFullYear();

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const ETABLISSEMENT_1 = {
  etablissement_id: 'etab-1',
  etablissement_nom: 'Faculté des Sciences',
  annee: ANNEE,
  compteurs: {
    partenaires: 4,
    conventions_actives: 2,
    conventions_expirees: 1,
    cotutelles: 1,
    projets_actifs: 3,
  },
  items: [
    {
      id: 'item-domaine',
      etablissement_id: 'etab-1',
      annee: ANNEE,
      type: 'DOMAINE_PRINCIPAL',
      valeur: 'Biologie marine',
    },
  ],
  partenaires_strategiques: [
    { id: 'ps-1', partenaire_id: 'p-1', partenaire_nom: 'AUF' },
  ],
};

const ETABLISSEMENT_2 = {
  etablissement_id: 'etab-2',
  etablissement_nom: 'Faculté des Lettres',
  annee: ANNEE,
  compteurs: {
    partenaires: 3,
    conventions_actives: 5,
    conventions_expirees: 0,
    cotutelles: 2,
    projets_actifs: 4,
  },
  items: [
    {
      id: 'item-defi',
      etablissement_id: 'etab-2',
      annee: ANNEE,
      type: 'DEFI_MAJEUR',
      valeur: 'Équipements vétustes',
    },
    {
      id: 'item-priorite',
      etablissement_id: 'etab-2',
      annee: ANNEE,
      type: 'PRIORITE_FUTURE',
      valeur: 'Formation continue',
    },
  ],
  partenaires_strategiques: [],
};

const PARTENAIRES = [
  { id: 'p-1', nom: 'AUF', pays: 'Maroc', statut: 'ACTIF', etablissement_id: 'etab-1' },
  { id: 'p-2', nom: 'Université de Bordeaux', pays: 'France', statut: 'ACTIF', etablissement_id: 'etab-1' },
  { id: 'p-3', nom: 'IRD', pays: 'France', statut: 'SUSPENDU', etablissement_id: 'etab-2' },
];

function installerApi() {
  api.get.mockReset();
  api.post.mockReset();
  api.delete.mockReset();

  api.post.mockResolvedValue({ data: { id: 'nouveau' } });
  api.delete.mockResolvedValue({ data: undefined });

  api.get.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
    const annee = Number(config?.params?.annee ?? ANNEE);

    if (url === '/synthese') {
      return Promise.resolve({
        data: {
          annee,
          etablissements: [
            { ...ETABLISSEMENT_1, annee },
            { ...ETABLISSEMENT_2, annee },
          ],
        },
      });
    }

    if (url === '/synthese/etab-1') {
      return Promise.resolve({ data: { ...ETABLISSEMENT_1, annee } });
    }

    if (url === '/synthese/items') {
      const type = config?.params?.type as string | undefined;
      const etablissementId = config?.params?.etablissement_id as string | undefined;
      const items = [
        ...ETABLISSEMENT_1.items.map((item) => ({ ...item, annee })),
        ...ETABLISSEMENT_2.items.map((item) => ({ ...item, annee })),
      ].filter(
        (item) =>
          (!type || item.type === type) && (!etablissementId || item.etablissement_id === etablissementId),
      );

      return Promise.resolve({ data: { data: items, total: items.length } });
    }

    if (url === '/synthese/partenaires-strategiques') {
      const etablissementId = config?.params?.etablissement_id as string | undefined;
      const designations = [
        { id: 'ps-1', partenaire_id: 'p-1', partenaire_nom: 'AUF', etablissement_id: 'etab-1', annee },
      ];

      return Promise.resolve({
        data: designations.filter(
          (designation) => !etablissementId || designation.etablissement_id === etablissementId,
        ),
      });
    }

    if (url === '/partenaires') {
      return Promise.resolve({
        data: { data: PARTENAIRES, meta: { page: 1, limit: 100, total: PARTENAIRES.length, totalPages: 1 } },
      });
    }

    return Promise.reject(new Error(`URL non simulée : ${url}`));
  });
}

let conteneur: HTMLDivElement;
let racine: Root;

async function monter(page: ReactNode, chemin: string, motif: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);

  await act(async () => {
    racine.render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(
          MemoryRouter,
          { initialEntries: [chemin] },
          createElement(Routes, null, createElement(Route, { path: motif, element: page })),
        ),
      ),
    );
  });

  return conteneur;
}

/** Motif de route de la synthèse globale. */
const MOTIF_GLOBALE = '/:espace/synthese';
/** Motif de route de la synthèse d'un établissement. */
const MOTIF_ETABLISSEMENT = '/:espace/synthese/:etablissementId';

async function attendre(condition: () => boolean, message = 'condition non remplie') {
  const debut = Date.now();
  while (!condition()) {
    if (Date.now() - debut > 3000) {
      throw new Error(`Délai dépassé : ${message} | DOM: ${(conteneur?.textContent ?? '').slice(0, 400)}`);
    }
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  }
}

async function cliquer(element: Element | null | undefined) {
  if (!element) throw new Error('Élément à cliquer introuvable');
  await act(async () => {
    (element as HTMLElement).click();
  });
}

function bouton(texte: string, racineRecherche: ParentNode = conteneur): HTMLButtonElement | undefined {
  return Array.from(racineRecherche.querySelectorAll('button')).find((element) =>
    (element.textContent ?? '').trim().includes(texte),
  );
}

function sectionNarratif(libelle: string): HTMLElement {
  const sections = Array.from(conteneur.querySelectorAll('section'));
  const trouvee = sections.find((section) => section.querySelector('h4')?.textContent?.trim() === libelle);
  if (!trouvee) throw new Error(`Section narrative « ${libelle} » introuvable`);
  return trouvee as HTMLElement;
}

function texteKpi(libelle: string): string {
  const label = Array.from(conteneur.querySelectorAll('span')).find(
    (element) => element.textContent === libelle,
  );
  if (!label) throw new Error(`KPI « ${libelle} » introuvable`);
  return label.closest('div')?.parentElement?.textContent ?? '';
}

function dialogue(): HTMLElement {
  const contenu = document.querySelector('[data-slot="dialog-content"]');
  if (!contenu) throw new Error('Boîte de dialogue introuvable');
  return contenu as HTMLElement;
}

async function saisirTexte(element: HTMLTextAreaElement | HTMLInputElement, valeur: string) {
  const prototype =
    element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  await act(async () => {
    setter?.call(element, valeur);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function choisirOption(select: HTMLSelectElement, valeur: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;

  await act(async () => {
    setter?.call(select, valeur);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

async function soumettreFormulaire(formulaire: HTMLFormElement | null | undefined) {
  if (!formulaire) throw new Error('Formulaire introuvable');
  await act(async () => {
    formulaire.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  auth.role = 'PRESIDENCE';
  installerApi();
});

afterEach(async () => {
  await act(async () => {
    racine.unmount();
  });
  conteneur.remove();
});

describe('page Synthèse annuelle (globale)', () => {
  it('consolide les compteurs et liste les établissements', async () => {
    await monter(createElement(SynthesePage), '/presidence/synthese', MOTIF_GLOBALE);
    await attendre(() => conteneur.textContent?.includes('Faculté des Sciences') ?? false, 'établissements');

    expect(api.get).toHaveBeenCalledWith('/synthese', { params: { annee: ANNEE } });
    expect(texteKpi('Partenaires')).toContain('7');
    expect(texteKpi('Conventions actives')).toContain('7');
    expect(texteKpi('Conventions expirées')).toContain('1');
    expect(texteKpi('Cotutelles')).toContain('3');
    expect(texteKpi('Projets actifs')).toContain('7');

    // Complétude consolidée : 3 éléments renseignés sur 6 attendus.
    expect(conteneur.textContent).toContain('50%');

    // Éléments narratifs de l'année (GET /synthese/items) et partenaires
    // stratégiques (GET /synthese/partenaires-strategiques).
    expect(api.get).toHaveBeenCalledWith('/synthese/items', {
      params: { etablissement_id: undefined, annee: ANNEE, type: undefined },
    });
    expect(api.get).toHaveBeenCalledWith('/synthese/partenaires-strategiques', {
      params: { etablissement_id: undefined, annee: ANNEE },
    });

    await attendre(() => conteneur.textContent?.includes('Biologie marine') ?? false, 'éléments narratifs');
    expect(conteneur.textContent).toContain('Formation continue');
    expect(conteneur.textContent).toContain('AUF');

    const lien = conteneur.querySelector('a[href="/presidence/synthese/etab-1"]');
    expect(lien).not.toBeNull();
    expect(conteneur.querySelector('[data-testid="comparatif"]')?.getAttribute('data-series')).toBe('2');
  });

  it('filtre les éléments narratifs par type et par établissement', async () => {
    await monter(createElement(SynthesePage), '/presidence/synthese', MOTIF_GLOBALE);
    await attendre(() => conteneur.textContent?.includes('Biologie marine') ?? false, 'éléments narratifs');

    await choisirOption(conteneur.querySelector('#synthese-filtre-type') as HTMLSelectElement, 'DEFI_MAJEUR');
    await attendre(
      () =>
        api.get.mock.calls.some(
          ([url, config]) => url === '/synthese/items' && config?.params?.type === 'DEFI_MAJEUR',
        ),
      'filtre type transmis',
    );
    await attendre(
      () => (conteneur.textContent?.includes('Équipements vétustes') ?? false) && !conteneur.textContent?.includes('Biologie marine'),
      'liste filtrée par type',
    );

    await choisirOption(conteneur.querySelector('#synthese-filtre-etablissement') as HTMLSelectElement, 'etab-1');
    await attendre(
      () =>
        api.get.mock.calls.some(
          ([url, config]) =>
            url === '/synthese/items' &&
            config?.params?.type === 'DEFI_MAJEUR' &&
            config?.params?.etablissement_id === 'etab-1',
        ),
      'filtre établissement transmis',
    );

    await choisirOption(
      conteneur.querySelector('#synthese-filtre-partenaire-etablissement') as HTMLSelectElement,
      'etab-2',
    );
    await attendre(
      () =>
        api.get.mock.calls.some(
          ([url, config]) =>
            url === '/synthese/partenaires-strategiques' && config?.params?.etablissement_id === 'etab-2',
        ),
      'filtre établissement des partenaires transmis',
    );
  });

  it('recharge la synthèse lorsqu’on change d’année', async () => {
    await monter(createElement(SynthesePage), '/presidence/synthese', MOTIF_GLOBALE);
    await attendre(() => conteneur.textContent?.includes('Faculté des Sciences') ?? false, 'chargement initial');

    const selecteur = conteneur.querySelector('#synthese-annee') as HTMLSelectElement;
    expect(selecteur).not.toBeNull();

    await choisirOption(selecteur, String(ANNEE - 2));
    await attendre(
      () => api.get.mock.calls.some(([url, config]) => url === '/synthese' && config?.params?.annee === ANNEE - 2),
      'nouvelle année demandée',
    );

    await attendre(() => conteneur.textContent?.includes(String(ANNEE - 2)) ?? false, 'année affichée');
  });

  it('propose au Décideur la navigation de son espace en lecture seule', async () => {
    auth.role = 'DECIDEUR';
    await monter(createElement(SynthesePage), '/decideur/synthese', MOTIF_GLOBALE);
    await attendre(() => conteneur.textContent?.includes('Faculté des Sciences') ?? false, 'établissements');

    expect(conteneur.querySelector('a[href="/decideur/synthese/etab-1"]')).not.toBeNull();
    expect(conteneur.querySelector('a[href="/presidence/synthese/etab-1"]')).toBeNull();
    expect(bouton('Compléter')).toBeUndefined();
  });
});

describe('page Synthèse d’un établissement', () => {
  async function monterDetail() {
    await monter(createElement(SyntheseEtablissementPage), '/presidence/synthese/etab-1', MOTIF_ETABLISSEMENT);
    await attendre(() => conteneur.textContent?.includes('Biologie marine') ?? false, 'synthèse établissement');
  }

  it('affiche les compteurs, les éléments narratifs et les partenaires stratégiques', async () => {
    await monterDetail();

    expect(api.get).toHaveBeenCalledWith('/synthese/etab-1', { params: { annee: ANNEE } });
    expect(texteKpi('Partenaires')).toContain('4');
    expect(texteKpi('Conventions expirées')).toContain('1');

    expect(sectionNarratif('Domaine principal').textContent).toContain('Biologie marine');
    expect(sectionNarratif('Défi majeur').textContent).toContain('Non renseigné');
    expect(sectionNarratif('Priorité future').textContent).toContain('À compléter');
    expect(conteneur.textContent).toContain('AUF');
    expect(conteneur.textContent).toContain('Non renseigné pour');
  });

  it('crée un élément narratif manquant', async () => {
    await monterDetail();

    await cliquer(bouton('Renseigner', sectionNarratif('Défi majeur')));

    const zone = sectionNarratif('Défi majeur').querySelector('textarea') as HTMLTextAreaElement;
    expect(zone).not.toBeNull();
    await saisirTexte(zone, '  Budget insuffisant  ');
    await soumettreFormulaire(sectionNarratif('Défi majeur').querySelector('form'));

    await attendre(() => api.post.mock.calls.length > 0, 'création envoyée');
    expect(api.post).toHaveBeenCalledWith('/synthese/items', {
      etablissement_id: 'etab-1',
      annee: ANNEE,
      type: 'DEFI_MAJEUR',
      valeur: 'Budget insuffisant',
    });
  });

  it('refuse une valeur trop courte avant tout appel réseau', async () => {
    await monterDetail();

    await cliquer(bouton('Renseigner', sectionNarratif('Défi majeur')));
    const zone = sectionNarratif('Défi majeur').querySelector('textarea') as HTMLTextAreaElement;
    await saisirTexte(zone, 'ab');
    await soumettreFormulaire(sectionNarratif('Défi majeur').querySelector('form'));

    expect(sectionNarratif('Défi majeur').textContent).toContain('au moins 3 caractères');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('remplace la valeur d’un élément existant (suppression puis recréation)', async () => {
    await monterDetail();

    await cliquer(bouton('Modifier', sectionNarratif('Domaine principal')));

    const zone = sectionNarratif('Domaine principal').querySelector('textarea') as HTMLTextAreaElement;
    expect(zone.value).toBe('Biologie marine');
    await saisirTexte(zone, 'Biologie marine et halieutique');
    await soumettreFormulaire(sectionNarratif('Domaine principal').querySelector('form'));

    await attendre(() => api.post.mock.calls.length > 0, 'remplacement envoyé');
    expect(api.delete).toHaveBeenCalledWith('/synthese/items/item-domaine');
    expect(api.post).toHaveBeenCalledWith('/synthese/items', {
      etablissement_id: 'etab-1',
      annee: ANNEE,
      type: 'DOMAINE_PRINCIPAL',
      valeur: 'Biologie marine et halieutique',
    });
  });

  it('supprime un élément narratif après confirmation saisie', async () => {
    await monterDetail();

    await cliquer(bouton('Supprimer', sectionNarratif('Domaine principal')));
    const boite = dialogue();
    expect(boite.textContent).toContain('Supprimer cet élément de synthèse');

    const boutonConfirmation = bouton('Supprimer', boite) as HTMLButtonElement;
    expect(boutonConfirmation.disabled).toBe(true);

    const champ = boite.querySelector('#confirmation-saisie') as HTMLInputElement;
    await saisirTexte(champ, 'Domaine principal');
    await cliquer(bouton('Supprimer', dialogue()));

    await attendre(() => api.delete.mock.calls.length > 0, 'suppression envoyée');
    expect(api.delete).toHaveBeenCalledWith('/synthese/items/item-domaine');
  });

  it('désigne un partenaire stratégique parmi les partenaires de l’établissement', async () => {
    await monterDetail();

    await cliquer(bouton('Désigner un partenaire'));
    await attendre(
      () => (dialogue().querySelector('#synthese-partenaire-select') as HTMLSelectElement)?.options.length > 1,
      'partenaires chargés',
    );

    const select = dialogue().querySelector('#synthese-partenaire-select') as HTMLSelectElement;
    // Seuls les partenaires de l'établissement non encore désignés sont proposés.
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['', 'p-2']);

    await cliquer(dialogue().querySelector('input[type="checkbox"]'));
    await attendre(
      () => (dialogue().querySelector('#synthese-partenaire-select') as HTMLSelectElement).options.length === 3,
      'affichage élargi',
    );

    await choisirOption(dialogue().querySelector('#synthese-partenaire-select') as HTMLSelectElement, 'p-2');
    await cliquer(bouton('Désigner', dialogue()));

    await attendre(() => api.post.mock.calls.length > 0, 'désignation envoyée');
    expect(api.post).toHaveBeenCalledWith('/synthese/partenaires-strategiques', {
      etablissement_id: 'etab-1',
      annee: ANNEE,
      partenaire_id: 'p-2',
    });
  });

  it('retire un partenaire stratégique après confirmation saisie', async () => {
    await monterDetail();

    const boutonRetrait = conteneur.querySelector('button[aria-label="Retirer AUF"]');
    await cliquer(boutonRetrait);

    const boite = dialogue();
    const champ = boite.querySelector('#confirmation-saisie') as HTMLInputElement;
    await saisirTexte(champ, 'AUF');
    await cliquer(bouton('Retirer', dialogue()));

    await attendre(() => api.delete.mock.calls.length > 0, 'retrait envoyé');
    expect(api.delete).toHaveBeenCalledWith('/synthese/partenaires-strategiques/ps-1');
  });

  it('masque toute action de gestion pour le Décideur', async () => {
    auth.role = 'DECIDEUR';
    await monterDetail();

    expect(conteneur.textContent).toContain('Biologie marine');
    expect(conteneur.textContent).toContain('AUF');
    expect(conteneur.textContent).not.toContain('Renseigner');
    expect(conteneur.textContent).not.toContain('Modifier');
    expect(conteneur.textContent).not.toContain('Désigner un partenaire');
    expect(conteneur.querySelector('button[aria-label="Retirer AUF"]')).toBeNull();
    expect(conteneur.querySelector('a[href="/decideur/synthese"]')).not.toBeNull();
  });
});
