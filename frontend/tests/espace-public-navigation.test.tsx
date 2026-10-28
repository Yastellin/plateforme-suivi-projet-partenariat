// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FooterPublique } from "@/components/layout/FooterPublique";
import { TopbarPublique } from "@/components/layout/TopbarPublique";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function Harness() {
  const location = useLocation();
  return (
    <>
      <TopbarPublique />
      <output data-testid="chemin">{location.pathname}</output>
      <FooterPublique />
    </>
  );
}

let conteneur: HTMLDivElement;
let racine: Root;

async function monter(chemin: string) {
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
  await act(async () => {
    racine.render(
      createElement(
        MemoryRouter,
        { initialEntries: [chemin] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: "*", element: createElement(Harness) }),
        ),
      ),
    );
  });
  return conteneur;
}

beforeEach(() => {
  window.matchMedia = (requete: string) =>
    ({
      matches: false,
      media: requete,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe("navigation publique partenaires et partenariats", () => {
  it("expose deux liens distincts avec les bonnes destinations et sans accès interne", async () => {
    const page = await monter("/");
    const lienPartenaires = page.querySelector<HTMLAnchorElement>(
      'nav a[href="/partenaires"]',
    );
    const lienPartenariats = page.querySelector<HTMLAnchorElement>(
      'nav a[href="/partenariats"]',
    );

    expect(lienPartenaires?.textContent).toContain("Partenaires");
    expect(lienPartenariats?.textContent).toContain("Partenariats");
    expect(page.querySelector('a[href="/connexion"]')).toBeNull();
    expect(page.querySelector('footer a[href="/connexion"]')).toBeNull();
  });

  it("met à jour la page active et ferme le menu mobile après navigation", async () => {
    const page = await monter("/partenaires");
    const boutonMenu = page.querySelector<HTMLButtonElement>(".vt-menu-btn")!;

    await act(async () => boutonMenu.click());
    expect(boutonMenu.getAttribute("aria-expanded")).toBe("true");

    const lienPartenariats = page.querySelector<HTMLAnchorElement>(
      'nav a[href="/partenariats"]',
    )!;
    await act(async () => lienPartenariats.click());

    expect(page.querySelector('[data-testid="chemin"]')?.textContent).toBe(
      "/partenariats",
    );
    expect(boutonMenu.getAttribute("aria-expanded")).toBe("false");
    expect(
      page.querySelector('nav a[aria-current="page"]')?.getAttribute("href"),
    ).toBe("/partenariats");
  });

  it("propose les deux destinations dans le footer sans lien interne", async () => {
    const page = await monter("/");
    const footer = page.querySelector("footer")!;

    expect(
      footer.querySelector('a[href="/partenaires"]')?.textContent,
    ).toContain("Partenaires");
    expect(
      footer.querySelector('a[href="/partenariats"]')?.textContent,
    ).toContain("Partenariats");
    expect(footer.querySelector('a[href="/connexion"]')).toBeNull();
  });

  it("conserve des liens de footer tabulables et exclusivement publics", async () => {
    const page = await monter("/");
    const liens = [...page.querySelectorAll<HTMLAnchorElement>("footer a")];

    expect(liens.length).toBeGreaterThan(0);
    for (const lien of liens) {
      expect(lien.tabIndex).toBeGreaterThanOrEqual(0);
      expect(lien.getAttribute("href")).not.toMatch(
        /connexion|espace-interne|dashboard/,
      );
      lien.focus();
      expect(document.activeElement).toBe(lien);
    }
  });
});
