// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CLE_BROUILLON_PARTENARIAT_SESSION } from '@/features/partenariats/session-draft';
import { PartenariatWizard } from '@/features/partenariats/components/PartenariatWizard';

const mocks = vi.hoisted(() => ({
  utilisateur: { id: 'utilisateur-1', role: 'PRESIDENCE' },
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ utilisateur: mocks.utilisateur }) }));
vi.mock('@/components/shared/GardeNavigation', () => ({ GardeNavigation: () => null }));
vi.mock('@/components/forms/wizard/useWizardDraft', () => ({
  useWizardDraft: () => ({ effacerBrouillon: vi.fn() }),
}));
vi.mock('@/features/partenariats/api/useCreatePartenariat', () => ({
  useCreatePartenariat: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/features/partenariats/components/SelectionPartenaires', () => ({
  SelectionPartenaires: ({
    selection,
    libelles,
    onCreerPartenaire,
  }: {
    selection: string[];
    libelles: Record<string, string>;
    onCreerPartenaire: (nom: string) => void;
  }) => createElement(
    'div',
    null,
    createElement('p', { 'data-testid': 'partenaires-selectionnes' }, selection.map((id) => libelles[id] ?? id).join(', ')),
    createElement('button', { type: 'button', onClick: () => onCreerPartenaire('Nouveau partenaire') }, 'Créer partenaire test'),
  ),
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function EmplacementRoute() {
  const location = useLocation();
  return createElement('output', { 'data-testid': 'route-courante' }, `${location.pathname}${location.search}`);
}

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  window.sessionStorage.clear();
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

async function afficherWizard() {
  await act(async () => {
    racine.render(createElement(
      MemoryRouter,
      { initialEntries: ['/presidence/partenaires-partenariats/partenariats/nouveau'] },
      createElement(PartenariatWizard),
      createElement(EmplacementRoute),
    ));
  });
}

describe('wizard de création de partenariat', () => {
  it('affiche trois étapes, sans étape Établissements', async () => {
    await afficherWizard();

    const etapes = conteneur.querySelectorAll('ol li');
    expect(etapes).toHaveLength(3);
    expect(conteneur.textContent).toContain('Partenaires');
    expect(conteneur.textContent).toContain('Informations');
    expect(conteneur.textContent).toContain('Récapitulatif');
    expect(conteneur.textContent).not.toContain('Établissements');
  });

  it('réinjecte le partenaire du brouillon puis supprime le brouillon de session', async () => {
    const brouillon = {
      formulaire: {
        intitule: 'Partenariat restauré',
        objet: 'Objet conservé',
        domaine: 'RECHERCHE',
        date_debut: '2026-11-01',
        date_fin: '',
        partenaires_ids: ['partenaire-nouveau'],
        etablissements_ids: [],
      },
      libelles: { 'partenaire-nouveau': 'Partenaire nouvellement créé' },
      etape: 0,
      version: 2,
      nomPartenaire: 'Partenaire nouvellement créé',
    };
    window.sessionStorage.setItem(CLE_BROUILLON_PARTENARIAT_SESSION, JSON.stringify(brouillon));

    await afficherWizard();

    expect(conteneur.querySelector('[data-testid="partenaires-selectionnes"]')?.textContent)
      .toBe('Partenaire nouvellement créé');
    expect(window.sessionStorage.getItem(CLE_BROUILLON_PARTENARIAT_SESSION)).toBeNull();
  });

  it('sauvegarde le nom et navigue vers la création complète du partenaire', async () => {
    await afficherWizard();
    const bouton = Array.from(conteneur.querySelectorAll('button'))
      .find((element) => element.textContent?.includes('Créer partenaire test'));
    expect(bouton).toBeDefined();

    await act(async () => bouton?.click());

    expect(conteneur.querySelector('[data-testid="route-courante"]')?.textContent)
      .toBe('/presidence/partenaires-partenariats/partenaires/nouveau?retour=wizard-partenariat');
    const brouillon = JSON.parse(window.sessionStorage.getItem(CLE_BROUILLON_PARTENARIAT_SESSION) ?? '{}');
    expect(brouillon.nomPartenaire).toBe('Nouveau partenaire');
    expect(brouillon.formulaire.etablissements_ids).toEqual([]);
  });
});
