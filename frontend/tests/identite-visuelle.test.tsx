// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/api-client", () => ({ default: api }));

import { LogoInstitutionnel } from "@/components/shared/LogoInstitutionnel";
import { IdentiteVisuelleProvider } from "@/contexts/IdentiteVisuelleProvider";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;
let queryClient: QueryClient;
let favicon: HTMLLinkElement;

beforeEach(() => {
  api.get.mockReset();
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.setAttribute("href", "/favicon.svg");
  favicon.setAttribute("type", "image/svg+xml");
  document.head.appendChild(favicon);
  racine = createRoot(conteneur);
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

afterEach(async () => {
  await act(async () => racine.unmount());
  queryClient.clear();
  favicon.remove();
  conteneur.remove();
});

describe("identité visuelle institutionnelle", () => {
  it("réutilise le logo configuré dans l'interface et dans le favicon", async () => {
    queryClient.setQueryData(["public", "configuration"], {
      logo_url: "/uploads/logos/presidence/logo-uf.png",
    });

    await act(async () => {
      racine.render(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(
            IdentiteVisuelleProvider,
            null,
            createElement(LogoInstitutionnel, {
              className: "h-10 w-10",
            }),
          ),
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(conteneur.querySelector("img")?.getAttribute("src")).toBe(
      "/api/uploads/logos/presidence/logo-uf.png",
    );
    expect(favicon.getAttribute("href")).toBe(
      "/api/uploads/logos/presidence/logo-uf.png",
    );
    expect(favicon.hasAttribute("type")).toBe(false);

    await act(async () => {
      queryClient.setQueryData(["public", "configuration"], {
        logo_url: "/uploads/logos/presidence/logo-remplace.png",
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(conteneur.querySelector("img")?.getAttribute("src")).toBe(
      "/api/uploads/logos/presidence/logo-remplace.png",
    );
    expect(favicon.getAttribute("href")).toBe(
      "/api/uploads/logos/presidence/logo-remplace.png",
    );

    favicon.dispatchEvent(new Event("error"));
    expect(favicon.getAttribute("href")).toBe("/favicon.svg");
    expect(favicon.getAttribute("type")).toBe("image/svg+xml");
  });

  it("affiche UF proprement tant qu'aucun logo n'est configuré", async () => {
    queryClient.setQueryData(["public", "configuration"], { logo_url: null });

    await act(async () => {
      racine.render(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(
            IdentiteVisuelleProvider,
            null,
            createElement(LogoInstitutionnel, {
              className: "h-10 w-10",
            }),
          ),
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(conteneur.querySelector("img")).toBeNull();
    expect(conteneur.textContent).toContain("UF");
    expect(favicon.getAttribute("href")).toBe("/favicon.svg");
    expect(favicon.getAttribute("type")).toBe("image/svg+xml");
  });
});
