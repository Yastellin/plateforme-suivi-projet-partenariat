// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const etat = vi.hoisted(() => ({
  requete: null as null | { queryFn: () => Promise<unknown> },
  get: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: { queryFn: () => Promise<unknown> }) => {
    etat.requete = options;
    return {
      isLoading: false,
      data: { data: [], meta: { page: 1, limit: 25, total: 0, totalPages: 0 } },
    };
  },
}));

vi.mock("@/lib/api-client", () => ({
  default: { get: etat.get },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ utilisateur: { role: "PRESIDENCE" } }),
}));

vi.mock("@/hooks/usePermissions", () => ({
  usePermissions: () => ({ peutTeleverser: true }),
}));

import { DocumentsListePage } from "@/features/documents/pages/DocumentsListePage";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  etat.requete = null;
  etat.get.mockReset().mockResolvedValue({
    data: { data: [], meta: { page: 1, limit: 25, total: 0, totalPages: 0 } },
  });
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe("filtrage de la liste globale des documents", () => {
  it.each([
    ["projet_id", "projet-1"],
    ["convention_id", "convention-2"],
    ["partenariat_id", "partenariat-3"],
  ])("transmet le filtre %s de l'URL à l'API", async (parametre, id) => {
    await act(async () => {
      racine.render(
        createElement(
          MemoryRouter,
          { initialEntries: [`/presidence/documents?${parametre}=${id}`] },
          createElement(DocumentsListePage),
        ),
      );
    });

    expect(conteneur.textContent).toContain("Filtre actif");
    await act(async () => {
      await etat.requete?.queryFn();
    });

    expect(etat.get).toHaveBeenCalledWith(
      "/documents",
      expect.objectContaining({
        params: expect.objectContaining({ [parametre]: id }),
      }),
    );
  });
});
