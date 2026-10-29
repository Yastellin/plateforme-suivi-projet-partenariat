// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { DemandeModificationProjetDialog } from '@/features/projets/components/DemandeModificationProjetDialog';
import type { Notification, RoleUtilisateur } from '@/types/api';

const etat = vi.hoisted(() => ({
  role: 'PRESIDENCE' as RoleUtilisateur,
  demander: vi.fn(),
  traiter: vi.fn(),
  marquerLue: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    utilisateur: {
      id: 'rakoto',
      email: 'rakoto@presidence.mg',
      role: etat.role,
      etablissement_nom: null,
    },
  }),
}));

vi.mock('@/features/projets/api/useDemandeModificationProjet', () => ({
  useDemanderModificationProjet: () => ({
    isPending: false,
    mutate: etat.demander,
  }),
  useTraiterDemandeModificationProjet: () => ({
    isPending: false,
    mutate: etat.traiter,
  }),
}));

vi.mock('@/features/notifications/api/useMarquerLue', () => ({
  useMarquerLue: () => ({ mutate: etat.marquerLue }),
}));

vi.mock('@/features/messages-contact/api/useMessagesContact', () => ({
  useSupprimerMessageContact: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

function bouton(libelle: string, position = 0): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
    .filter((element) => element.textContent?.includes(libelle))
    .at(position);
}

beforeEach(() => {
  etat.role = 'PRESIDENCE';
  etat.demander.mockReset();
  etat.traiter.mockReset();
  etat.marquerLue.mockReset();
  conteneur = document.createElement('div');
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe('demande de modification d’un projet', () => {
  it('exige un motif textuel avant de transmettre la demande', async () => {
    const onFermer = vi.fn();
    const onEnvoyee = vi.fn();
    etat.demander.mockImplementation(
      (_motif: string, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );

    await act(async () => {
      racine.render(
        createElement(DemandeModificationProjetDialog, {
          ouvert: true,
          projetId: 'projet-toliara',
          projetNom: 'Modernisation du campus de Toliara',
          onFermer,
          onEnvoyee,
        }),
      );
    });

    await act(async () => bouton('Envoyer la demande')?.click());
    expect(etat.demander).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain(
      'Le motif doit contenir au moins 10 caractères.',
    );

    const zone = document.body.querySelector<HTMLTextAreaElement>(
      '#motif-demande-modification',
    );
    expect(zone).not.toBeNull();
    await act(async () => {
      const definirValeur = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      definirValeur?.call(
        zone,
        'Le devis reçu à Toliara impose une révision du budget.',
      );
      zone?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => bouton('Envoyer la demande')?.click());

    expect(etat.demander).toHaveBeenCalledWith(
      'Le devis reçu à Toliara impose une révision du budget.',
      expect.any(Object),
    );
    expect(onEnvoyee).toHaveBeenCalledOnce();
    expect(onFermer).toHaveBeenCalledOnce();
  });

  it('permet à la Présidence d’approuver une notification de demande', async () => {
    const notification: Notification = {
      id: 'notification-1',
      titre: 'Demande de modification : Projet Toliara',
      message: 'Université de Toliara demande une correction du budget.',
      type: 'CHANGEMENT_STATUT',
      priorite: 'HAUTE',
      date_creation: '2026-10-23T08:00:00.000Z',
      est_lue: false,
      reference_type: 'DEMANDE_MODIFICATION_PROJET',
      reference_id: 'projet-toliara',
    };
    etat.traiter.mockImplementation(
      (
        _variables: unknown,
        options: { onSuccess: () => void },
      ) => options.onSuccess(),
    );

    await act(async () => {
      racine.render(createElement(NotificationItem, { notification }));
    });

    expect(bouton('Approuver')).toBeDefined();
    expect(bouton('Rejeter')).toBeDefined();

    await act(async () => bouton('Approuver')?.click());
    const confirmations = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>('button'),
    ).filter((element) => element.textContent?.includes('Approuver'));
    await act(async () => confirmations.at(-1)?.click());

    expect(etat.traiter).toHaveBeenCalledWith(
      { projetId: 'projet-toliara', decision: 'approuver' },
      expect.any(Object),
    );
  });

  it('ne présente pas les décisions à un établissement', async () => {
    etat.role = 'ETABLISSEMENT';
    const notification: Notification = {
      id: 'notification-2',
      titre: 'Demande de modification : Projet Toliara',
      message: 'Motif de la demande.',
      type: 'CHANGEMENT_STATUT',
      priorite: 'HAUTE',
      date_creation: '2026-10-23T08:00:00.000Z',
      est_lue: false,
      reference_type: 'DEMANDE_MODIFICATION_PROJET',
      reference_id: 'projet-toliara',
    };

    await act(async () => {
      racine.render(createElement(NotificationItem, { notification }));
    });

    expect(bouton('Approuver')).toBeUndefined();
    expect(bouton('Rejeter')).toBeUndefined();
  });
});
